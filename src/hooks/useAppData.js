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
  const [cotizaciones, setCotizaciones] = useState([]);
  
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
          { data: dbConfig },
          { data: dbCotizaciones }
        ] = await Promise.all([
          supabase.from('inventario').select('*').eq('user_id', user.id),
          supabase.from('eventos').select('*').eq('user_id', user.id),
          supabase.from('clientes').select('*, contactos_cliente(*)').eq('user_id', user.id),
          supabase.from('configuraciones').select('*').eq('user_id', user.id).maybeSingle(),
          // Cotizaciones doesn't have a direct user_id, we fetch all that belong to this user's eventos via RLS or a join. Since RLS handles it, we can just select '*'.
          supabase.from('cotizaciones').select('*')
        ]);

        if (dbItems) {
          _setRealInventoryItems(dbItems.map(mapDBToItem));
        }
        
        if (dbEventos) {
          const { data: dbEventoItems } = await supabase.from('evento_items').select('*');
          const evItemsMap = (dbEventoItems || []).reduce((acc, curr) => {
            if (!acc[curr.evento_id]) acc[curr.evento_id] = [];
            const itemKey = String(curr.item_id);
            const existing = acc[curr.evento_id].find(i => String(i.itemId) === itemKey);
            if (!existing) {
              acc[curr.evento_id].push({
                itemId: curr.item_id,
                cantidad: curr.cantidad,
                precioUnitario: curr.precio_unitario
              });
            }
            return acc;
          }, {});

          const clientNames = (dbClientes || []).reduce((acc, c) => {
            acc[c.id] = c.nombre;
            return acc;
          }, {});

          const formattedEvents = dbEventos.map(ev => ({
            ...mapDBToEvent(ev),
            cliente: clientNames[ev.cliente_id] ?? '',
            organizador: clientNames[ev.organizador_id] ?? '',
            itemsSeleccionados: evItemsMap[ev.id] || []
          }));
          _setEventos(formattedEvents);
        }

        if (dbClientes) {
          _setClientes(dbClientes.map(c => {
            const contactos = (c.contactos_cliente || []).map(co => ({
              id: co.id,
              nombre: co.nombre,
              telefono: co.telefono,
              email: co.email,
              esPrincipal: co.es_principal
            }));
            return { id: c.id, nombre: c.nombre, tipo: c.tipo, documento: c.documento, contactos };
          }));
        }

        if (dbConfig) {
          if (dbConfig.pesos) setPesos(dbConfig.pesos);
          if (dbConfig.app_settings) setAppSettings(dbConfig.app_settings);
          if (dbConfig.event_settings) setEventSettings(dbConfig.event_settings);
        }

        if (dbCotizaciones) {
          setCotizaciones(dbCotizaciones.map(mapDBCotizacion));
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
            const seen = new Set();
            const deduped = ev.itemsSeleccionados.filter((i) => {
              const key = String(i.itemId || i.id);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            const payload = deduped.map(i => ({
              evento_id: String(ev.id),
              item_id: String(i.itemId || i.id),
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
        id: c.id,
        nombre: c.nombre,
        tipo: c.tipo,
        documento: c.documento
      })).then(async () => {
        const { added, updated } = getArrayDiff(prev, next);
        const changedClients = [...added, ...updated];

        for (const client of changedClients) {
          const { error: delErr } = await supabase.from('contactos_cliente').delete().eq('cliente_id', client.id);
          if (delErr) console.error('Failed delete from contactos_cliente:', delErr);

          if (client.contactos && client.contactos.length > 0) {
            const contactsPayload = client.contactos.map(c => ({
              cliente_id: client.id,
              nombre: c.nombre ?? '',
              telefono: c.telefono ?? null,
              email: c.email ?? null,
              es_principal: Boolean(c.esPrincipal ?? c.es_principal)
            }));
            const { error } = await supabase.from('contactos_cliente').insert(contactsPayload);
            if (error) console.error('Failed insert to contactos_cliente:', error);
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

  // Cotizaciones savers
  const saveCotizacionVersion = async (eventoId, version, itemsSnapshot, total, notasVersion = '') => {
    if (!user) return null;
    const payload = {
      evento_id: String(eventoId),
      version,
      items_snapshot: itemsSnapshot,
      total,
      estado: 'Pendiente',
      notas_version: notasVersion
    };
    
    const { data, error } = await supabase.from('cotizaciones').insert([payload]).select().single();
    if (error) {
       console.error("Failed to save cotizacion", error);
       return null;
    }
    
    if (data) {
       setCotizaciones(prev => [...prev, mapDBCotizacion(data)]);
    }
    return data;
  };

  const updateCotizacionStatus = async (cotizacionId, newStatus) => {
    if (!user) return;
    const { error } = await supabase.from('cotizaciones')
        .update({ estado: newStatus })
        .eq('id', cotizacionId);
        
    if (error) {
        console.error("Failed to update cotizacion status", error);
        return;
    }
    
    setCotizaciones(prev => prev.map(c => c.id === cotizacionId ? { ...c, estado: newStatus } : c));
  };


  return {
    eventos, setEventos,
    clientes, setClientes,
    pesos, setPesos: savePesos,
    appSettings, setAppSettings: saveAppSettings,
    eventSettings, setEventSettings: saveEventSettings,
    realInventoryItems, setRealInventoryItems,
    cotizaciones, saveCotizacionVersion, updateCotizacionStatus,
    loading
  };
}

// Helpers
function mapDBToItem(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    marca: row.marca ?? '',
    linkCompra: row.link_compra ?? '',
    imagenUrl: row.imagen_url ?? '',
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
    marca: item.marca ?? '',
    link_compra: item.linkCompra ?? '',
    imagen_url: item.imagenUrl ?? '',
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

function mapDBCotizacion(row) {
  return {
    id: row.id,
    eventoId: row.evento_id,
    version: row.version,
    itemsSnapshot: row.items_snapshot,
    total: row.total,
    estado: row.estado,
    notasVersion: row.notas_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
