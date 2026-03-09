import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Helper to determine what changed between arrays of objects (assumes 'id' is primary key)
function getArrayDiff(prev, next) {
  const added = next.filter(n => !prev.find(p => p.id === n.id));
  const updated = next.filter(n => {
    const p = prev.find(p => p.id === n.id);
    return p && JSON.stringify(p) !== JSON.stringify(n);
  });
  const deleted = prev.find ? prev.filter(p => !next.find(n => n.id === p.id)) : [];
  return { added, updated, deleted };
}

export function useAppData() {
  const { user } = useAuth();
  
  const [eventos, _setEventos] = useState([]);
  const [clientes, _setClientes] = useState([]);
  const [pesos, setPesos] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [eventSettings, setEventSettings] = useState(null);
  const [realInventoryItems, _setRealInventoryItems] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // 1. Initial Load
  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      try {
        const [
          { data: dbItems }, 
          { data: dbEventos }, 
          { data: dbClientes },
          { data: dbConfig }
        ] = await Promise.all([
          supabase.from('inventario').select('*').eq('user_id', user.id),
          supabase.from('eventos').select('*').eq('user_id', user.id),
          supabase.from('clientes').select('*, contactos_cliente(*)').eq('user_id', user.id),
          supabase.from('configuraciones').select('*').eq('user_id', user.id).maybeSingle()
        ]);

        if (dbItems) {
          _setRealInventoryItems(dbItems.map(mapDBToItem));
        }
        
        if (dbEventos) {
          const { data: dbEventoItems } = await supabase.from('evento_items').select('*');
          const evItemsMap = (dbEventoItems || []).reduce((acc, curr) => {
            if (!acc[curr.evento_id]) acc[curr.evento_id] = [];
            acc[curr.evento_id].push({
              itemId: curr.item_id,
              cantidad: curr.cantidad,
              precioUnitario: curr.precio_unitario
            });
            return acc;
          }, {});

          const formattedEvents = dbEventos.map(ev => ({
            ...mapDBToEvent(ev),
            itemsSeleccionados: evItemsMap[ev.id] || []
          }));
          _setEventos(formattedEvents);
        }

        if (dbClientes) {
          _setClientes(dbClientes.map(c => ({
            id: c.id,
            nombre: c.nombre,
            tipo: c.tipo,
            documento: c.documento,
            contactos: c.contactos_cliente || []
          })));
        }

        if (dbConfig) {
          if (dbConfig.pesos) setPesos(dbConfig.pesos);
          if (dbConfig.app_settings) setAppSettings(dbConfig.app_settings);
          if (dbConfig.event_settings) setEventSettings(dbConfig.event_settings);
        }

      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  // --- PROXIES TO SYNC LOCAL STATE TO SUPABASE ---

  const syncArrayToDB = useCallback(async (table, prev, next, transformToDB) => {
    if (!user) return;
    const { added, updated, deleted } = getArrayDiff(prev, next);
    
    const upserts = [...added, ...updated].map(item => ({
      ...transformToDB(item),
      user_id: user.id
    }));

    if (upserts.length > 0) {
      const { error } = await supabase.from(table).upsert(upserts);
      if (error) console.error(`Failed upsert to ${table}:`, error);
    }

    if (deleted.length > 0) {
      const idsToDelete = deleted.map(d => String(d.id));
      const { error } = await supabase.from(table).delete().in('id', idsToDelete);
      if (error) console.error(`Failed delete from ${table}:`, error);
    }
  }, [user]);

  const setRealInventoryItems = useCallback((updater) => {
    _setRealInventoryItems(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncArrayToDB('inventario', prev, next, mapItemToDB);
      return next;
    });
  }, [syncArrayToDB]);

  const setEventos = useCallback((updater) => {
    _setEventos(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncArrayToDB('eventos', prev, next, mapEventToDB).then(async () => {
        // Handle Event Items
        const { added, updated } = getArrayDiff(prev, next);
        const changedEvents = [...added, ...updated];
        
        for (const ev of changedEvents) {
          await supabase.from('evento_items').delete().eq('evento_id', String(ev.id));
          if (ev.itemsSeleccionados && ev.itemsSeleccionados.length > 0) {
            const payload = ev.itemsSeleccionados.map(i => ({
              evento_id: String(ev.id),
              item_id: String(i.itemId),
              cantidad: i.cantidad,
              precio_unitario: i.precioUnitario
            }));
            await supabase.from('evento_items').insert(payload);
          }
        }
      });
      return next;
    });
  }, [syncArrayToDB]);

  const setClientes = useCallback((updater) => {
    _setClientes(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      syncArrayToDB('clientes', prev, next, c => ({
        id: String(c.id),
        nombre: c.nombre,
        tipo: c.tipo,
        documento: c.documento
      })).then(async () => {
        // Sync contacts
        const { added, updated } = getArrayDiff(prev, next);
        const changedClients = [...added, ...updated];
        
        for (const client of changedClients) {
          await supabase.from('contactos_cliente').delete().eq('cliente_id', String(client.id));
          if (client.contactos && client.contactos.length > 0) {
            const contactsPayload = client.contactos.map(c => ({
              id: String(c.id),
              cliente_id: String(client.id),
              nombre: c.nombre,
              telefono: c.telefono,
              email: c.email,
              es_principal: c.esPrincipal || c.es_principal
            }));
            await supabase.from('contactos_cliente').insert(contactsPayload);
          }
        }
      });
      return next;
    });
  }, [syncArrayToDB]);

  // Config savers
  const savePesos = async (newPesos) => {
    setPesos(newPesos);
    if (user) await supabase.from('configuraciones').upsert({ user_id: user.id, pesos: newPesos });
  };
  const saveAppSettings = async (newSettings) => {
    setAppSettings(newSettings);
    if (user) await supabase.from('configuraciones').upsert({ user_id: user.id, app_settings: newSettings });
  };
  const saveEventSettings = async (newSettings) => {
    setEventSettings(newSettings);
    if (user) await supabase.from('configuraciones').upsert({ user_id: user.id, event_settings: newSettings });
  };

  return {
    eventos, setEventos,
    clientes, setClientes,
    pesos, setPesos: savePesos,
    appSettings, setAppSettings: saveAppSettings,
    eventSettings, setEventSettings: saveEventSettings,
    realInventoryItems, setRealInventoryItems,
    loading
  };
}

// Helpers
function mapDBToItem(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    cantidad: row.cantidad,
    costo: row.costo,
    precioAlquiler: row.precio_alquiler,
    costoTransporte: row.costo_transporte,
    rotacion: row.rotacion,
    almacenamiento: row.almacenamiento,
    facilidadTransporte: row.facilidad_transporte,
    durabilidad: row.durabilidad,
    vecesAlquilado: row.veces_alquilado,
    ingresosHistoricos: row.ingresos_historicos
  };
}

function mapItemToDB(item) {
  return {
    id: String(item.id),
    nombre: item.nombre,
    categoria: item.categoria,
    cantidad: item.cantidad || 0,
    costo: item.costo || 0,
    precio_alquiler: item.precioAlquiler || 0,
    costo_transporte: item.costoTransporte || 0,
    rotacion: item.rotacion || 5,
    almacenamiento: item.almacenamiento || 5,
    facilidad_transporte: item.facilidadTransporte || 5,
    durabilidad: item.durabilidad || 5,
    veces_alquilado: item.vecesAlquilado || item.veces_alquilado_total || 0,
    ingresos_historicos: item.ingresosHistoricos || item.ingresos_totales || 0
  };
}

function mapDBToEvent(row) {
  return {
    id: row.id,
    nombreEvento: row.nombre_evento,
    clienteId: row.cliente_id,
    organizadorId: row.organizador_id,
    fecha: row.fecha,
    lugar: row.lugar,
    direccion: row.direccion,
    estado: row.estado,
    costoTransporte: row.costo_transporte,
    depositoSeguridad: row.deposito_seguridad,
    totalAlquiler: row.total_alquiler,
    totalGeneral: row.total_general,
    notas: row.notas,
    fechaCotizacion: row.fecha_cotizacion,
    fechaValidez: row.fecha_validez,
    horaEntrega: row.hora_entrega,
    fechaRecogida: row.fecha_recogida,
    horaRecogida: row.hora_recogida,
    fechaPago: row.fecha_pago,
    comprobantePago: row.comprobante_pago,
    cotizacionEnviada: row.cotizacion_enviada
  };
}

function mapEventToDB(ev) {
  return {
    id: String(ev.id),
    nombre_evento: ev.nombreEvento,
    cliente_id: ev.clienteId ? String(ev.clienteId) : null,
    organizador_id: ev.organizadorId ? String(ev.organizadorId) : null,
    fecha: ev.fecha,
    lugar: ev.lugar,
    direccion: ev.direccion,
    estado: ev.estado,
    costo_transporte: ev.costoTransporte,
    deposito_seguridad: ev.depositoSeguridad,
    total_alquiler: ev.totalAlquiler,
    total_general: ev.totalGeneral,
    notas: ev.notas,
    fecha_cotizacion: ev.fechaCotizacion,
    fecha_validez: ev.fechaValidez,
    hora_entrega: ev.horaEntrega,
    fecha_recogida: ev.fechaRecogida,
    hora_recogida: ev.horaRecogida,
    fecha_pago: ev.fechaPago,
    comprobante_pago: ev.comprobantePago,
    cotizacion_enviada: ev.cotizacionEnviada
  };
}
