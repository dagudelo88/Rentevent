import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Palette, RotateCcw } from 'lucide-react';

const EventSettingsModal = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [activeTab, setActiveTab] = useState('alerts');
    const [settings, setSettings] = useState(currentSettings);

    // Reset settings when modal opens with new currentSettings
    useEffect(() => {
        if (isOpen) {
            setSettings(currentSettings);
        }
    }, [isOpen, currentSettings]);

    const handleAlertChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            alerts: {
                ...prev.alerts,
                [key]: parseInt(value) || 0
            }
        }));
    };

    const handleColorChange = (status, colorClass) => {
        setSettings(prev => ({
            ...prev,
            statusColors: {
                ...prev.statusColors,
                [status]: colorClass
            }
        }));
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const handleResetDefaults = () => {
        const defaults = {
            alerts: { quoteWarning: 7, eventUrgent: 15 },
            statusColors: {
                'Confirmado': 'bg-blue-100 text-blue-700',
                'Pago': 'bg-emerald-100 text-emerald-700',
                'Realizado & Pagado': 'bg-purple-100 text-purple-700',
                'Cancelado': 'bg-red-100 text-red-700',
                'Cotizado': 'bg-yellow-100 text-yellow-700'
            }
        };
        setSettings(defaults);
    };

    if (!isOpen) return null;

    const STATUS_OPTIONS = [
        { name: 'Confirmado', label: 'Confirmado' },
        { name: 'Pago', label: 'Pago' },
        { name: 'Realizado & Pagado', label: 'Realizado & Pagado' },
        { name: 'Cancelado', label: 'Cancelado' },
        { name: 'Cotizado', label: 'Cotizado' },
    ];

    const COLOR_PALETTE = [
        { class: 'bg-slate-100 text-slate-700', label: 'Gris' },
        { class: 'bg-red-100 text-red-700', label: 'Rojo' },
        { class: 'bg-orange-100 text-orange-700', label: 'Naranja' },
        { class: 'bg-amber-100 text-amber-700', label: 'Ambar' },
        { class: 'bg-yellow-100 text-yellow-700', label: 'Amarillo' },
        { class: 'bg-lime-100 text-lime-700', label: 'Lima' },
        { class: 'bg-green-100 text-green-700', label: 'Verde' },
        { class: 'bg-emerald-100 text-emerald-700', label: 'Esmeralda' },
        { class: 'bg-teal-100 text-teal-700', label: 'Verdepato' },
        { class: 'bg-cyan-100 text-cyan-700', label: 'Cian' },
        { class: 'bg-sky-100 text-sky-700', label: 'Cielo' },
        { class: 'bg-blue-100 text-blue-700', label: 'Azul' },
        { class: 'bg-indigo-100 text-indigo-700', label: 'Indigo' },
        { class: 'bg-violet-100 text-violet-700', label: 'Violeta' },
        { class: 'bg-purple-100 text-purple-700', label: 'Púrpura' },
        { class: 'bg-fuchsia-100 text-fuchsia-700', label: 'Fucsia' },
        { class: 'bg-pink-100 text-pink-700', label: 'Rosa' },
        { class: 'bg-rose-100 text-rose-700', label: 'Rosa intenso' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Configuración de Eventos</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`flex-1 p-4 text-sm font-medium flex justify-center items-center gap-2 transition relative
              ${activeTab === 'alerts' ? 'text-indigo-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    >
                        <AlertTriangle size={18} /> Alertas de Fecha
                        {activeTab === 'alerts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`flex-1 p-4 text-sm font-medium flex justify-center items-center gap-2 transition relative
              ${activeTab === 'colors' ? 'text-indigo-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    >
                        <Palette size={18} /> Colores de Estado
                        {activeTab === 'colors' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={18} /> Alerta de Cotización Antigua
                                </h3>
                                <p className="text-sm text-orange-600 mb-4">
                                    Define cuántos días deben pasar desde la creación de una cotización para considerarla "antigua".
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700">Mostrar advertencia después de:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={settings.alerts.quoteWarning}
                                        onChange={(e) => handleAlertChange('quoteWarning', e.target.value)}
                                        className="w-20 p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                    <span className="text-sm font-medium text-slate-700">días</span>
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={18} /> Alerta de Evento Próximo
                                </h3>
                                <p className="text-sm text-red-600 mb-4">
                                    Define con cuántos días de anticipación se debe marcar un evento cotizado como "Urgente" o "Próximo".
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700">Marcar como urgente si faltan menos de:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={settings.alerts.eventUrgent}
                                        onChange={(e) => handleAlertChange('eventUrgent', e.target.value)}
                                        className="w-20 p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700 focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                    <span className="text-sm font-medium text-slate-700">días</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'colors' && (
                        <div className="space-y-6">
                            <p className="text-sm text-slate-500 mb-4">
                                Personaliza los colores para cada estado del evento. Esto afectará tanto a la vista de lista como a la de tarjetas.
                            </p>

                            <div className="grid grid-cols-1 gap-6">
                                {STATUS_OPTIONS.map(status => (
                                    <div key={status.name} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                                        <div className="w-40 font-bold text-slate-700 text-sm">
                                            {status.label}
                                        </div>

                                        <div className="flex-1 flex flex-wrap gap-2">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${settings.statusColors[status.name]} mb-2 sm:mb-0 mr-4 flex items-center justify-center min-w-[100px]`}>
                                                Vista Previa
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {COLOR_PALETTE.map(color => (
                                                    <button
                                                        key={color.class}
                                                        onClick={() => handleColorChange(status.name, color.class)}
                                                        className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm transition hover:scale-110 ${color.class.split(' ')[0]} ${settings.statusColors[status.name] === color.class ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}
                                                        title={color.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    <button
                        onClick={handleResetDefaults}
                        className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-3 py-2 rounded transition"
                    >
                        <RotateCcw size={16} /> Restaurar valores por defecto
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
                        >
                            <Save size={18} /> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSettingsModal;
