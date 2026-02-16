import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, Download, TrendingUp, Package, Truck,
  AlertCircle, Settings, RotateCcw, Calendar, Users, FileText, CheckCircle,
  DollarSign, MapPin, Phone, Calculator, Search, Clock, CheckSquare
} from 'lucide-react';

// --- CONFIGURACIÓN Y UTILERÍAS ---

const CATEGORIAS = [
  "Mobiliario (Sillas/Mesas)",
  "Lounge & Salas",
  "Mantelería & Textiles",
  "Menaje & Vajilla",
  "Decoración & Ambientación",
  "Estructuras & Carpas",
  "Iluminación & Audio"
];

const DEFAULT_WEIGHTS = {
  rotacion: 30,
  roi: 20,
  almacenamiento: 10,
  facilidadTransporte: 10,
  costoTransporte: 15,
  durabilidad: 15
};

// Datos combinados (Métricas cualitativas + Historial real)
const DATOS_INICIALES = [
  { id: 1, nombre: "Silla Tiffany Dorada", categoria: "Mobiliario (Sillas/Mesas)", costo: 85000, precioAlquiler: 5500, costoTransporte: 500, rotacion: 9, almacenamiento: 7, facilidadTransporte: 8, durabilidad: 6, cantidad: 200, vecesAlquilado: 15, ingresosHistoricos: 16500000 },
  { id: 2, nombre: "Sala Lounge Chester (8 pax)", categoria: "Lounge & Salas", costo: 1800000, precioAlquiler: 400000, costoTransporte: 80000, rotacion: 6, almacenamiento: 3, facilidadTransporte: 2, durabilidad: 8, cantidad: 5, vecesAlquilado: 3, ingresosHistoricos: 1200000 },
  { id: 3, nombre: "Plato Base Rattán", categoria: "Menaje & Vajilla", costo: 25000, precioAlquiler: 3500, costoTransporte: 100, rotacion: 8, almacenamiento: 8, facilidadTransporte: 9, durabilidad: 5, cantidad: 150, vecesAlquilado: 8, ingresosHistoricos: 4200000 },
  { id: 4, nombre: "Mesa Madera Rústica", categoria: "Mobiliario (Sillas/Mesas)", costo: 450000, precioAlquiler: 65000, costoTransporte: 15000, rotacion: 7, almacenamiento: 4, facilidadTransporte: 5, durabilidad: 9, cantidad: 20, vecesAlquilado: 6, ingresosHistoricos: 7800000 },
  { id: 5, nombre: "Copa Agua Cristal", categoria: "Menaje & Vajilla", costo: 12000, precioAlquiler: 1200, costoTransporte: 50, rotacion: 9, almacenamiento: 9, facilidadTransporte: 8, durabilidad: 4, cantidad: 300, vecesAlquilado: 25, ingresosHistoricos: 9000000 },
  { id: 6, nombre: "Cubertería Dorada (Set 3pz)", categoria: "Menaje & Vajilla", costo: 45000, precioAlquiler: 4500, costoTransporte: 50, rotacion: 8, almacenamiento: 9, facilidadTransporte: 9, durabilidad: 7, cantidad: 200, vecesAlquilado: 12, ingresosHistoricos: 10800000 },
  { id: 7, nombre: "Mesa Redonda (10 pax)", categoria: "Mobiliario (Sillas/Mesas)", costo: 250000, precioAlquiler: 35000, costoTransporte: 12000, rotacion: 8, almacenamiento: 5, facilidadTransporte: 6, durabilidad: 8, cantidad: 30, vecesAlquilado: 10, ingresosHistoricos: 10500000 },
  { id: 8, nombre: "Mantel Blanco Jacquard", categoria: "Mantelería & Textiles", costo: 60000, precioAlquiler: 15000, costoTransporte: 2000, rotacion: 7, almacenamiento: 9, facilidadTransporte: 9, durabilidad: 6, cantidad: 50, vecesAlquilado: 20, ingresosHistoricos: 15000000 },
  { id: 9, nombre: "Servilleta Tela Sand", categoria: "Mantelería & Textiles", costo: 8000, precioAlquiler: 1500, costoTransporte: 100, rotacion: 8, almacenamiento: 10, facilidadTransporte: 10, durabilidad: 5, cantidad: 400, vecesAlquilado: 18, ingresosHistoricos: 10800000 },
  { id: 10, nombre: "Carpa 10x10 Blanca", categoria: "Estructuras & Carpas", costo: 5000000, precioAlquiler: 800000, costoTransporte: 200000, rotacion: 4, almacenamiento: 2, facilidadTransporte: 2, durabilidad: 7, cantidad: 2, vecesAlquilado: 5, ingresosHistoricos: 4000000 },
  { id: 11, nombre: "Pista Baile LED (m2)", categoria: "Iluminación & Audio", costo: 350000, precioAlquiler: 60000, costoTransporte: 5000, rotacion: 6, almacenamiento: 6, facilidadTransporte: 7, durabilidad: 7, cantidad: 36, vecesAlquilado: 15, ingresosHistoricos: 32400000 },
  { id: 12, nombre: "Centro Mesa Floral Artificial", categoria: "Decoración & Ambientación", costo: 120000, precioAlquiler: 35000, costoTransporte: 3000, rotacion: 5, almacenamiento: 4, facilidadTransporte: 6, durabilidad: 8, cantidad: 20, vecesAlquilado: 8, ingresosHistoricos: 5600000 },
  { id: 13, nombre: "Silla Crossback Madera", categoria: "Mobiliario (Sillas/Mesas)", costo: 110000, precioAlquiler: 7500, costoTransporte: 600, rotacion: 8, almacenamiento: 6, facilidadTransporte: 7, durabilidad: 8, cantidad: 150, vecesAlquilado: 10, ingresosHistoricos: 11250000 },
  { id: 14, nombre: "Plato Principal Loza Blanca", categoria: "Menaje & Vajilla", costo: 18000, precioAlquiler: 2000, costoTransporte: 100, rotacion: 9, almacenamiento: 8, facilidadTransporte: 7, durabilidad: 5, cantidad: 350, vecesAlquilado: 22, ingresosHistoricos: 15400000 },
];

const EVENTOS_INICIALES = [
  {
    id: 101,
    cliente: "Boda Laura & Andrés",
    fecha: "2026-03-15",
    lugar: "Jardín Botánico",
    telefono: "300 123 4567",
    estado: "Confirmado",
    itemsSeleccionados: [
      { itemId: 1, nombre: "Silla Tiffany Dorada", cantidad: 80, precioUnitario: 5500 },
      { itemId: 4, nombre: "Mesa Madera Rústica", cantidad: 8, precioUnitario: 65000 },
      { itemId: 5, nombre: "Copa Agua Cristal", cantidad: 80, precioUnitario: 1200 }
    ],
    costoTransporte: 180000,
    depositoSeguridad: 500000,
    totalAlquiler: 1056000,
    totalGeneral: 1736000,
    notas: "Entrega por la puerta norte."
  },
  {
    id: 102,
    cliente: "15 Años Sofía",
    fecha: "2026-04-20",
    lugar: "Salón Social El Poblado",
    telefono: "310 987 6543",
    estado: "Cotización",
    itemsSeleccionados: [
      { itemId: 2, nombre: "Sala Lounge Chester (8 pax)", cantidad: 2, precioUnitario: 400000 },
      { itemId: 11, nombre: "Pista Baile LED (m2)", cantidad: 16, precioUnitario: 60000 },
      { itemId: 12, nombre: "Centro Mesa Floral Artificial", cantidad: 4, precioUnitario: 35000 }
    ],
    costoTransporte: 120000,
    depositoSeguridad: 300000,
    totalAlquiler: 1900000,
    totalGeneral: 2320000,
    notas: "Pendiente confirmar medidas del salón."
  },
  {
    id: 103,
    cliente: "Evento Corporativo Bancolombia",
    fecha: "2025-12-10",
    lugar: "Plaza Mayor",
    telefono: "320 555 1234",
    estado: "Realizado",
    itemsSeleccionados: [
      { itemId: 1, nombre: "Silla Tiffany Dorada", cantidad: 200, precioUnitario: 5500 },
      { itemId: 7, nombre: "Mesa Redonda (10 pax)", cantidad: 20, precioUnitario: 35000 },
      { itemId: 8, nombre: "Mantel Blanco Jacquard", cantidad: 20, precioUnitario: 15000 }
    ],
    costoTransporte: 250000,
    depositoSeguridad: 1000000,
    totalAlquiler: 2100000,
    totalGeneral: 3350000,
    notas: "Todo entregado ok."
  },
  {
    id: 104,
    cliente: "Cumpleaños 50 Carlos",
    fecha: "2026-02-14",
    lugar: "Casa Campestre Llanogrande",
    telefono: "315 222 3344",
    estado: "Cancelado",
    itemsSeleccionados: [
      { itemId: 10, nombre: "Carpa 10x10 Blanca", cantidad: 1, precioUnitario: 800000 },
      { itemId: 13, nombre: "Silla Crossback Madera", cantidad: 50, precioUnitario: 7500 }
    ],
    costoTransporte: 300000,
    depositoSeguridad: 600000,
    totalAlquiler: 1175000,
    totalGeneral: 2075000,
    notas: "Cancelado por lluvia pronosticada."
  }
];

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// --- LÓGICA DE NEGOCIO ---

// 1. Algoritmo de Puntuación (Meta-Score) RESTAURADO
const calcularMetricas = (item, pesos) => {
  // A. Rentabilidad Unitaria (Predictiva)
  const margenNeto = item.precioAlquiler - (item.costoTransporte || 0);
  const paybackEventos = margenNeto > 0 ? (item.costo / margenNeto) : 999;

  // B. Puntuación ROI (Predictiva)
  let scoreROI = 0;
  if (margenNeto <= 0) scoreROI = 0;
  else if (paybackEventos <= 5) scoreROI = 10;
  else if (paybackEventos <= 10) scoreROI = 8;
  else if (paybackEventos <= 20) scoreROI = 6;
  else if (paybackEventos <= 30) scoreROI = 4;
  else scoreROI = 2;

  // C. Eficiencia Transporte (Predictiva)
  let scoreCostoTransp = 0;
  if (item.precioAlquiler > 0) {
    const ratioTransp = (item.costoTransporte || 0) / item.precioAlquiler;
    if (ratioTransp <= 0.05) scoreCostoTransp = 10;
    else if (ratioTransp <= 0.15) scoreCostoTransp = 8;
    else if (ratioTransp <= 0.30) scoreCostoTransp = 5;
    else if (ratioTransp <= 0.50) scoreCostoTransp = 2;
    else scoreCostoTransp = 0;
  }

  // D. Cálculo Meta Score Ponderado
  const scoreFacilidadTransp = item.facilidadTransporte || 5;
  const scoreRotacion = item.rotacion || 5;
  const scoreAlmacen = item.almacenamiento || 5;
  const scoreDurabilidad = item.durabilidad || 5;

  const sumaPesos = Object.values(pesos).reduce((a, b) => a + b, 0);
  const factor = sumaPesos > 0 ? (100 / sumaPesos) : 1;

  const weightedScore = (
    (scoreRotacion * (pesos.rotacion * factor) / 10) +
    (scoreROI * (pesos.roi * factor) / 10) +
    (scoreAlmacen * (pesos.almacenamiento * factor) / 10) +
    (scoreFacilidadTransp * (pesos.facilidadTransporte * factor) / 10) +
    (scoreCostoTransp * (pesos.costoTransporte * factor) / 10) +
    (scoreDurabilidad * (pesos.durabilidad * factor) / 10)
  );

  // Clasificación Meta-Score
  let clasificacion = "";
  let colorClass = "";
  if (margenNeto <= 0) { clasificacion = "⛔ Pérdida"; colorClass = "bg-red-200 text-red-900 border-red-300"; }
  else if (weightedScore >= 80) { clasificacion = "💎 Joya"; colorClass = "bg-green-100 text-green-800 border-green-200"; }
  else if (weightedScore >= 60) { clasificacion = "✅ Bueno"; colorClass = "bg-blue-100 text-blue-800 border-blue-200"; }
  else if (weightedScore >= 40) { clasificacion = "⚠️ Regular"; colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200"; }
  else { clasificacion = "❌ Riesgo"; colorClass = "bg-red-100 text-red-800 border-red-200"; }

  // E. Métricas Reales (Históricas)
  const ingresosTotales = (item.vecesAlquilado || 0) * item.precioAlquiler;
  const porcentajeRecuperado = item.costo > 0 ? Math.min(100, (ingresosTotales / item.costo) * 100) : 0;
  const yaSePago = ingresosTotales >= item.costo;

  return {
    margenNeto,
    paybackEventos: paybackEventos === 999 ? ">100" : paybackEventos.toFixed(1),
    score: weightedScore.toFixed(0),
    clasificacion,
    colorClass,
    ingresosTotales,
    porcentajeRecuperado,
    yaSePago
  };
};

export default function WeddingRentalApp() {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('inventory');

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('wedding_inventory_v8');
    return saved ? JSON.parse(saved) : DATOS_INICIALES;
  });

  const [eventos, setEventos] = useState(() => {
    const saved = localStorage.getItem('wedding_events_v4');
    return saved ? JSON.parse(saved) : EVENTOS_INICIALES;
  });

  const [pesos, setPesos] = useState(() => {
    const saved = localStorage.getItem('wedding_weights_v2');
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });

  // UI States
  const [showItemForm, setShowItemForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Event Form State
  const [eventForm, setEventForm] = useState({
    id: null, cliente: '', fecha: '', lugar: '', telefono: '', estado: 'Cotización',
    itemsSeleccionados: [], costoTransporte: 0, depositoSeguridad: 0, notas: '',
    fechaCotizacion: new Date().toISOString().split('T')[0]
  });

  const [sliderValues, setSliderValues] = useState({
    rotacion: 5, almacenamiento: 5, facilidadTransporte: 5, durabilidad: 5
  });

  // Persistencia
  useEffect(() => { localStorage.setItem('wedding_inventory_v8', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('wedding_events_v4', JSON.stringify(eventos)); }, [eventos]);
  useEffect(() => { localStorage.setItem('wedding_weights_v2', JSON.stringify(pesos)); }, [pesos]);

  useEffect(() => {
    if (showItemForm) {
      setSliderValues({
        rotacion: editingItem?.rotacion || 5,
        almacenamiento: editingItem?.almacenamiento || 5,
        facilidadTransporte: editingItem?.facilidadTransporte || 5,
        durabilidad: editingItem?.durabilidad || 5
      });
    }
  }, [showItemForm, editingItem]);

  // --- HANDLERS (Pesos & Config) ---
  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setPesos(prev => ({ ...prev, [name]: Number(value) }));
  };
  const resetWeights = () => setPesos(DEFAULT_WEIGHTS);
  const sumaPesos = Object.values(pesos).reduce((a, b) => a + b, 0);

  // --- HANDLERS (Eventos) ---
  const handleSaveEvent = () => {
    const totalAlquiler = eventForm.itemsSeleccionados.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
    const totalGeneral = totalAlquiler + Number(eventForm.costoTransporte);

    const nuevoEvento = {
      ...eventForm,
      id: eventForm.id || Date.now(),
      totalAlquiler,
      totalGeneral,
      fechaCotizacion: eventForm.fechaCotizacion || new Date().toISOString().split('T')[0],
      fechaCreacion: eventForm.id ? eventForm.fechaCreacion : new Date().toISOString()
    };

    if (editingEvent) {
      const eventoAnterior = eventos.find(e => e.id === editingEvent.id);
      if (nuevoEvento.estado === 'Realizado' && eventoAnterior.estado !== 'Realizado') {
        actualizarUsoInventario(nuevoEvento.itemsSeleccionados);
      }
      setEventos(prev => prev.map(e => e.id === editingEvent.id ? nuevoEvento : e));
    } else {
      setEventos(prev => [...prev, nuevoEvento]);
    }

    setShowEventForm(false);
    setEditingEvent(null);
    resetEventForm();
  };

  const actualizarUsoInventario = (itemsAlquilados) => {
    setItems(prevItems => prevItems.map(invItem => {
      const alquilado = itemsAlquilados.find(i => i.itemId === invItem.id);
      if (alquilado) {
        return {
          ...invItem,
          vecesAlquilado: (invItem.vecesAlquilado || 0) + 1,
          ingresosHistoricos: (invItem.ingresosHistoricos || 0) + (alquilado.precioUnitario * alquilado.cantidad)
        };
      }
      return invItem;
    }));
  };

  const addItemToEvent = (item, qty) => {
    const existing = eventForm.itemsSeleccionados.find(i => i.itemId === item.id);
    if (existing) {
      setEventForm(prev => ({
        ...prev,
        itemsSeleccionados: prev.itemsSeleccionados.map(i => i.itemId === item.id ? { ...i, cantidad: Number(qty) } : i)
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        itemsSeleccionados: [...prev.itemsSeleccionados, { itemId: item.id, nombre: item.nombre, cantidad: Number(qty), precioUnitario: item.precioAlquiler }]
      }));
    }
  };

  const removeItemFromEvent = (itemId) => {
    setEventForm(prev => ({ ...prev, itemsSeleccionados: prev.itemsSeleccionados.filter(i => i.itemId !== itemId) }));
  };

  const resetEventForm = () => {
    setEventForm({
      id: null, cliente: '', fecha: '', lugar: '', telefono: '', estado: 'Cotización',
      itemsSeleccionados: [], costoTransporte: 0, depositoSeguridad: 0, notas: '',
      fechaCotizacion: new Date().toISOString().split('T')[0]
    });
  };

  // --- HANDLERS (Inventario) ---
  const handleSaveItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      nombre: formData.get('nombre'),
      categoria: formData.get('categoria'),
      costo: Number(formData.get('costo')),
      precioAlquiler: Number(formData.get('precioAlquiler')),
      costoTransporte: Number(formData.get('costoTransporte')),
      cantidad: Number(formData.get('cantidad')),
      rotacion: Number(formData.get('rotacion')),
      almacenamiento: Number(formData.get('almacenamiento')),
      facilidadTransporte: Number(formData.get('facilidadTransporte')),
      durabilidad: Number(formData.get('durabilidad')),
      vecesAlquilado: editingItem ? editingItem.vecesAlquilado : 0,
      ingresosHistoricos: editingItem ? editingItem.ingresosHistoricos : 0,
    };

    if (editingItem) setItems(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
    else setItems(prev => [...prev, newItem]);

    setShowItemForm(false);
    setEditingItem(null);
  };

  // --- RENDERIZADO ---

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      {/* HEADER PRINCIPAL */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between h-auto md:h-16 items-center py-4 md:py-0 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-400" />
              <span className="font-bold text-xl tracking-tight">Bodas Medellín ERP</span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setActiveTab('inventory')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                  Inventario & Análisis
                </button>
                <button onClick={() => setActiveTab('events')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'events' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                  Eventos
                </button>
              </nav>
              {activeTab === 'inventory' && (
                <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded transition ${showConfig ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`} title="Configurar Algoritmo">
                  <Settings size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PANEL DE CONFIGURACIÓN (SLIDERS RESTAURADOS) */}
      {showConfig && activeTab === 'inventory' && (
        <div className="bg-slate-800 text-white p-6 border-b border-slate-700 animate-in slide-in-from-top-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400"><Settings size={20} /> Calibración del Meta-Score</h2>
                <p className="text-sm text-slate-400">Ajusta qué tanto influye cada variable en la puntuación de compra.</p>
              </div>
              <button onClick={resetWeights} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-700 px-3 py-1 rounded">
                <RotateCcw size={12} /> Restaurar
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { key: 'rotacion', label: 'Rotación', desc: 'Demanda estimada' },
                { key: 'roi', label: 'Payback (ROI)', desc: 'Velocidad retorno' },
                { key: 'almacenamiento', label: 'Almacén', desc: 'Eficiencia espacio' },
                { key: 'facilidadTransporte', label: 'Facilidad Transp.', desc: 'Manejo/Carga' },
                { key: 'costoTransporte', label: 'Costo Logístico', desc: 'Eficiencia costo' },
                { key: 'durabilidad', label: 'Durabilidad', desc: 'Vida útil' },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="font-medium text-slate-300">{field.label}</label>
                    <span className="font-bold text-indigo-400">{pesos[field.key]}%</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" name={field.key} value={pesos[field.key]} onChange={handleWeightChange} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end gap-2 text-sm">
              <span className="text-slate-400">Peso Total:</span>
              <span className={`font-bold ${sumaPesos === 100 ? 'text-green-400' : 'text-orange-400'}`}>{sumaPesos}%</span>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* --- VISTA INVENTARIO --- */}
        {activeTab === 'inventory' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Package className="text-indigo-600" /> Inventario & Rentabilidad
              </h2>
              <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
                <Plus size={18} /> Nuevo Ítem
              </button>
            </div>

            {/* Tabla Inventario */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                      <th className="p-4">Producto</th>
                      <th className="p-4 text-center">Unitario (COP)</th>
                      <th className="p-4 text-center">Logística (1-10)</th>
                      <th className="p-4 text-center bg-indigo-50/50">Meta Score</th>
                      <th className="p-4 text-center">ROI Real</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => {
                      const metrics = calcularMetricas(item, pesos);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition group">
                          <td className="p-4">
                            <div className="font-bold text-slate-800 text-base">{item.nombre}</div>
                            <div className="text-slate-500 text-xs bg-slate-100 inline-block px-2 rounded mt-1">{item.categoria}</div>
                            <div className="text-slate-400 text-xs mt-1">Stock: {item.cantidad} | Rotación: {item.rotacion}/10</div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="space-y-1">
                              <div className="text-xs text-slate-500 flex justify-between gap-2"><span>Alq:</span> <span className="text-slate-800 font-medium">{formatoCOP.format(item.precioAlquiler)}</span></div>
                              <div className="text-xs text-slate-500 flex justify-between gap-2"><span>Costo:</span> <span className="text-slate-800 font-medium">{formatoCOP.format(item.costo)}</span></div>
                              <div className="text-[10px] text-orange-600 flex justify-between gap-2 border-t border-slate-100 pt-1"><span>Transp:</span> <span>-{formatoCOP.format(item.costoTransporte)}</span></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1" title="Facilidad Almacenamiento"><Package size={12} className="text-blue-400" /> <div className="w-12 h-1 bg-slate-200 rounded"><div className="h-full bg-blue-400" style={{ width: `${item.almacenamiento * 10}%` }}></div></div></div>
                              <div className="flex items-center gap-1" title="Facilidad Transporte"><Truck size={12} className="text-orange-400" /> <div className="w-12 h-1 bg-slate-200 rounded"><div className="h-full bg-orange-400" style={{ width: `${item.facilidadTransporte * 10}%` }}></div></div></div>
                              <div className="flex items-center gap-1" title="Durabilidad"><AlertCircle size={12} className="text-purple-400" /> <div className="w-12 h-1 bg-slate-200 rounded"><div className="h-full bg-purple-400" style={{ width: `${item.durabilidad * 10}%` }}></div></div></div>
                            </div>
                          </td>
                          <td className="p-4 text-center bg-indigo-50/30">
                            <div className={`inline-flex flex-col items-center justify-center p-2 rounded-lg border w-16 ${metrics.colorClass}`}>
                              <span className="text-xl font-bold leading-none">{metrics.score}</span>
                              <span className="text-[9px] font-bold uppercase mt-1">{metrics.clasificacion.split(" ")[1] || "N/A"}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1">Payback: {metrics.paybackEventos} ev.</div>
                          </td>
                          <td className="p-4 w-40">
                            <div className="w-full bg-slate-200 rounded-full h-2 mb-1 overflow-hidden">
                              <div className={`h-2 rounded-full ${metrics.yaSePago ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${metrics.porcentajeRecuperado}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span>{metrics.porcentajeRecuperado.toFixed(0)}%</span>
                              {metrics.yaSePago ? <span className="text-green-600 font-bold">PAGADO</span> : <span className="text-slate-400">En proceso</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 text-center bg-slate-100 rounded px-1">
                              Uso: {item.vecesAlquilado} veces
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit2 size={16} /></button>
                              <button onClick={() => { if (window.confirm('Eliminar?')) setItems(prev => prev.filter(i => i.id !== item.id)) }} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VISTA EVENTOS --- */}
        {activeTab === 'events' && (
          <div className="animate-in fade-in duration-300">

            {/* KANBAN SUMMARY */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Cotizaciones', status: 'Cotización', icon: FileText, color: 'bg-yellow-100 text-yellow-700' },
                { label: 'Confirmados', status: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
                { label: 'Realizados', status: 'Realizado', icon: Truck, color: 'bg-purple-100 text-purple-700' },
                { label: 'Pagados', status: 'Pagado', icon: DollarSign, color: 'bg-green-100 text-green-700' },
                { label: 'Cancelados', status: 'Cancelado', icon: X, color: 'bg-red-100 text-red-700' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {eventos.filter(e => e.estado === stat.status).length}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-indigo-600" /> Gestión de Eventos
              </h2>
              <button onClick={() => { resetEventForm(); setShowEventForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
                <Plus size={18} /> Crear Cotización
              </button>
            </div>

            {/* SECCIÓN ACTIVOS (Cotizaciones y Confirmados) */}
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18} /> Eventos Activos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {eventos.filter(e => ['Cotización', 'Confirmado'].includes(e.estado)).map(evento => {
                // Lógica de Alertas
                const diasAntiguedad = Math.floor((new Date() - new Date(evento.fechaCotizacion)) / (1000 * 60 * 60 * 24));
                const diasParaEvento = Math.floor((new Date(evento.fecha) - new Date()) / (1000 * 60 * 60 * 24));

                let alerta = null;
                if (evento.estado === 'Cotización') {
                  if (diasAntiguedad > 7) alerta = { type: 'warning', text: `Cotización antigua (${diasAntiguedad} días)` };
                  if (diasParaEvento < 15 && diasParaEvento >= 0) alerta = { type: 'urgent', text: `Evento cercano (${diasParaEvento} días)` };
                }

                return (
                  <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition relative overflow-hidden">
                    {alerta && (
                      <div className={`absolute top-0 left-0 w-1 h-full ${alerta.type === 'urgent' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{evento.cliente}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1"><MapPin size={12} /> {evento.lugar}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${evento.estado === 'Confirmado' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{evento.estado}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded">
                      <div>
                        <span className="block font-medium text-slate-400">Cotizado:</span>
                        {evento.fechaCotizacion || 'N/A'}
                      </div>
                      <div>
                        <span className="block font-medium text-slate-400">Evento:</span>
                        <span className={diasParaEvento < 7 ? "text-red-500 font-bold" : ""}>{evento.fecha}</span>
                      </div>
                    </div>

                    {alerta && (
                      <div className={`flex items-center gap-2 text-xs font-bold mb-3 ${alerta.type === 'urgent' ? 'text-red-600' : 'text-yellow-600'}`}>
                        <AlertCircle size={14} /> {alerta.text}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Total Cliente</span><span className="font-bold text-indigo-600">{formatoCOP.format(evento.totalGeneral)}</span></div>
                    </div>
                    <button onClick={() => { setEditingEvent(evento); setEventForm(evento); setShowEventForm(true); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded text-sm font-medium transition">Ver / Editar</button>
                  </div>
                );
              })}
            </div>

            {/* SECCIÓN HISTÓRICO (Realizados, Pagados, Cancelados) */}
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-t pt-6"><CheckSquare size={18} /> Histórico de Eventos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {eventos.filter(e => ['Realizado', 'Pagado', 'Cancelado'].includes(e.estado)).map(evento => (
                <div key={evento.id} className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-700">{evento.cliente}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1"><Calendar size={12} /> {evento.fecha}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold 
                      ${evento.estado === 'Pagado' ? 'bg-green-100 text-green-700' :
                        evento.estado === 'Realizado' ? 'bg-purple-100 text-purple-700' :
                          'bg-red-100 text-red-700'}`}>
                      {evento.estado}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-4"><span className="text-slate-500">Total Final</span><span className="font-bold text-slate-600">{formatoCOP.format(evento.totalGeneral)}</span></div>
                  <button onClick={() => { setEditingEvent(evento); setEventForm(evento); setShowEventForm(true); }} className="w-full border border-slate-300 text-slate-500 hover:bg-white py-1.5 rounded text-xs font-medium transition">Ver Detalle</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL ITEMS */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowItemForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X /></button>
              <h3 className="text-lg font-bold mb-4">{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Nombre</label><input required name="nombre" defaultValue={editingItem?.nombre} className="w-full border p-2 rounded" placeholder="Ej: Silla Tiffany" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Categoría</label><select name="categoria" defaultValue={editingItem?.categoria || CATEGORIAS[0]} className="w-full border p-2 rounded">{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Cantidad (Stock)</label><input type="number" name="cantidad" required defaultValue={editingItem?.cantidad || 1} className="w-full border p-2 rounded" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Costo Compra</label><input type="number" name="costo" required defaultValue={editingItem?.costo} className="w-full border p-2 rounded" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Precio Alquiler</label><input type="number" name="precioAlquiler" required defaultValue={editingItem?.precioAlquiler} className="w-full border p-2 rounded" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Costo Logística Unit.</label><input type="number" name="costoTransporte" defaultValue={editingItem?.costoTransporte || 0} className="w-full border p-2 rounded" /></div>

                {/* SLIDERS PARA ITEM */}
                <div className="col-span-2 bg-slate-50 p-4 rounded-lg mt-2">
                  <p className="text-xs font-bold text-slate-500 mb-3 uppercase flex items-center gap-2"><Settings size={12} /> Calibración (1-10)</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { n: 'rotacion', l: 'Rotación (Demanda)' }, { n: 'almacenamiento', l: 'Facilidad Almacén' },
                      { n: 'facilidadTransporte', l: 'Facilidad Carga' }, { n: 'durabilidad', l: 'Durabilidad' }
                    ].map(f => (
                      <div key={f.n}>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-slate-600 block">{f.l}</label>
                          <span className="text-xs font-bold text-indigo-600">{sliderValues[f.n]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          name={f.n}
                          value={sliderValues[f.n] || 5}
                          onChange={(e) => setSliderValues(prev => ({ ...prev, [f.n]: Number(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowItemForm(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded shadow">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EVENTOS */}
        {showEventForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="text-xl font-bold text-slate-800">{editingEvent ? 'Editar Evento' : 'Nueva Cotización'}</h3>
                <button onClick={() => setShowEventForm(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-4">
                    <div><label className="text-xs font-bold text-slate-500">Cliente</label><input value={eventForm.cliente} onChange={e => setEventForm({ ...eventForm, cliente: e.target.value })} className="w-full border p-2 rounded" placeholder="Nombre..." /></div>
                    <div><label className="text-xs font-bold text-slate-500">Fecha</label><input type="date" value={eventForm.fecha} onChange={e => setEventForm({ ...eventForm, fecha: e.target.value })} className="w-full border p-2 rounded" /></div>
                    <div><label className="text-xs font-bold text-slate-500">Lugar</label><input value={eventForm.lugar} onChange={e => setEventForm({ ...eventForm, lugar: e.target.value })} className="w-full border p-2 rounded" /></div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">Estado</label>
                      <select value={eventForm.estado} onChange={e => setEventForm({ ...eventForm, estado: e.target.value })} className="w-full border p-2 rounded font-medium">
                        <option value="Cotización">Cotización (Borrador)</option>
                        <option value="Confirmado">Confirmado (Reserva)</option>
                        <option value="Realizado">Realizado (Entregado)</option>
                        <option value="Pagado">Pagado (Finalizado)</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                    <div><label className="text-xs font-bold text-slate-500">Fecha Cotización</label><input type="date" value={eventForm.fechaCotizacion || ''} onChange={e => setEventForm({ ...eventForm, fechaCotizacion: e.target.value })} className="w-full border p-2 rounded text-slate-500" /></div>
                  </div>
                  <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto whitespace-nowrap">
                      {items.map(item => (
                        <button key={item.id} onClick={() => addItemToEvent(item, 1)} className="inline-block bg-white border px-3 py-1 rounded-full text-xs mr-2 mb-2 shadow-sm hover:border-indigo-500">{item.nombre} (${item.precioAlquiler})</button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto border rounded-lg mb-4 p-2">
                      {eventForm.itemsSeleccionados.map((selItem, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b py-2 text-sm">
                          <span>{selItem.nombre}</span>
                          <div className="flex items-center gap-2">
                            <input type="number" value={selItem.cantidad} onChange={(e) => addItemToEvent({ id: selItem.itemId }, e.target.value)} className="w-12 border rounded text-center" />
                            <span className="w-20 text-right font-medium">{formatoCOP.format(selItem.cantidad * selItem.precioUnitario)}</span>
                            <button onClick={() => removeItemFromEvent(selItem.itemId)} className="text-red-400"><X size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between"><span>Subtotal:</span> <span className="font-bold">{formatoCOP.format(eventForm.itemsSeleccionados.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0))}</span></div>
                      <div className="flex justify-between items-center"><span>Transporte:</span> <input type="number" value={eventForm.costoTransporte} onChange={e => setEventForm({ ...eventForm, costoTransporte: e.target.value })} className="w-24 border rounded text-right" /></div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t text-indigo-700"><span>Total:</span> <span>{formatoCOP.format(eventForm.itemsSeleccionados.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0) + Number(eventForm.costoTransporte))}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-white rounded-b-xl flex justify-end gap-3">
                <button onClick={() => setShowEventForm(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition">Cancelar</button>
                <button onClick={handleSaveEvent} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2"><Save size={18} /> Guardar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
