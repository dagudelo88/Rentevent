import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function mapDBToRankingItem(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    costo: row.costo,
    precioAlquiler: row.precio_alquiler,
    costoTransporte: row.costo_transporte,
    rotacion: row.rotacion,
    almacenamiento: row.almacenamiento,
    facilidadTransporte: row.facilidad_transporte,
    durabilidad: row.durabilidad,
    cantidad: row.cantidad,
    vecesAlquilado: row.veces_alquilado,
    ingresosHistoricos: row.ingresos_historicos,
    imageUrl: row.image_url,
    purchaseLink: row.purchase_link,
  };
}

function mapRankingItemToDB(item) {
  return {
    nombre: item.nombre,
    categoria: item.categoria,
    costo: item.costo || 0,
    precio_alquiler: item.precioAlquiler || 0,
    costo_transporte: item.costoTransporte || 0,
    rotacion: item.rotacion || 5,
    almacenamiento: item.almacenamiento || 5,
    facilidad_transporte: item.facilidadTransporte || 5,
    durabilidad: item.durabilidad || 5,
    cantidad: item.cantidad || 0,
    veces_alquilado: item.vecesAlquilado || 0,
    ingresos_historicos: item.ingresosHistoricos || 0,
    image_url: item.imageUrl || null,
    purchase_link: item.purchaseLink || null,
  };
}

export function useProductRanking() {
  const { user } = useAuth();
  const [rankingItems, setRankingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('producto_ranking')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) console.error('Failed to load ranking items:', error);
        else setRankingItems((data || []).map(mapDBToRankingItem));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  /**
   * Upserts a ranking item. If the item has no id, Supabase generates
   * a UUID automatically (no Date.now() hacks needed).
   */
  const saveRankingItem = useCallback(async (item) => {
    if (!user) return;

    const isNew = !item.id;
    const payload = {
      ...mapRankingItemToDB(item),
      user_id: user.id,
      ...(isNew ? {} : { id: item.id }),
    };

    const { data, error } = await supabase
      .from('producto_ranking')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error('Failed to save ranking item:', error);
      return;
    }

    const saved = mapDBToRankingItem(data);
    setRankingItems(prev =>
      isNew ? [...prev, saved] : prev.map(i => i.id === saved.id ? saved : i)
    );
  }, [user]);

  const deleteRankingItem = useCallback(async (id) => {
    if (!user) return;

    const { error } = await supabase
      .from('producto_ranking')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete ranking item:', error);
      return;
    }

    setRankingItems(prev => prev.filter(i => i.id !== id));
  }, [user]);

  return { rankingItems, saveRankingItem, deleteRankingItem, loading };
}
