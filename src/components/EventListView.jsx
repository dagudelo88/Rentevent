import React, { useState, useMemo } from 'react';
import {
    Edit2, Trash2, ChevronLeft, ChevronRight, Filter,
    CheckCircle, Clock, AlertCircle, X, DollarSign, CheckSquare,
    Settings, Columns, FileText, Truck, MapPin, User, ChevronUp, ChevronDown, ArrowUpDown
} from 'lucide-react';

const EventListView = ({ events, onEdit, onDelete, formatCurrency, settings }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [showColumnConfig, setShowColumnConfig] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'asc' }); // Default sort by date
    const itemsPerPage = 10;

    // Configuración de Columnas Completa
    const ALL_COLUMNS = [
        { key: 'nombre', label: 'Evento / Cliente', required: true, sortable: true },
        { key: 'fecha', label: 'Fecha Evento', required: true, sortable: true },
        { key: 'estado', label: 'Estado', required: true, sortable: true },
        { key: 'lugar', label: 'Lugar', sortable: true },
        { key: 'direccion', label: 'Dirección Entrega', sortable: true },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'organizador', label: 'Organizador', sortable: true },
        { key: 'fechaCotizacion', label: 'F. Cotización', sortable: true },
        { key: 'fechaValidez', label: 'F. Validez', sortable: true },
        { key: 'cotizacionEnviada', label: 'Cot. Enviada', sortable: true },
        { key: 'horaEntrega', label: 'Hora Entrega', sortable: true },
        { key: 'fechaRecogida', label: 'F. Recogida', sortable: true },
        { key: 'horaRecogida', label: 'Hora Recogida', sortable: true },
        { key: 'total', label: 'Total General', required: true, sortable: true },
        { key: 'costoTransporte', label: 'Costo Transp.', sortable: true },
        { key: 'depositoSeguridad', label: 'Depósito', sortable: true },
        { key: 'fechaPago', label: 'F. Pago', sortable: true },
        { key: 'comprobantePago', label: 'Comprobante' },
        { key: 'notas', label: 'Notas' },
        { key: 'acciones', label: 'Acciones', required: true }
    ];

    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem('eventListColumns');
        return saved ? JSON.parse(saved) : ['nombre', 'fecha', 'estado', 'lugar', 'total', 'acciones'];
    });

    const toggleColumn = (key) => {
        let newColumns;
        if (visibleColumns.includes(key)) {
            newColumns = visibleColumns.filter(k => k !== key);
        } else {
            newColumns = [...visibleColumns, key];
        }
        setVisibleColumns(newColumns);
        localStorage.setItem('eventListColumns', JSON.stringify(newColumns));
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtrado y Ordenamiento
    const processedEvents = useMemo(() => {
        let data = [...events];

        // 1. Filtrar
        if (filterStatus !== 'Todos') {
            data = data.filter(event => event.estado === filterStatus);
        }

        // 2. Ordenar
        if (sortConfig.key) {
            data.sort((a, b) => {
                let aValue, bValue;

                // Mapeo de campos especiales para ordenamiento
                switch (sortConfig.key) {
                    case 'nombre':
                        aValue = (a.nombreEvento || '') + (a.cliente || '');
                        bValue = (b.nombreEvento || '') + (b.cliente || '');
                        break;
                    case 'total':
                        aValue = a.totalGeneral || 0;
                        bValue = b.totalGeneral || 0;
                        break;
                    case 'fechaCotizacion':
                        aValue = new Date(a.fechaCotizacion || '1970-01-01').getTime();
                        bValue = new Date(b.fechaCotizacion || '1970-01-01').getTime();
                        break;
                    case 'fecha':
                        aValue = new Date(a.fecha || '1970-01-01').getTime();
                        bValue = new Date(b.fecha || '1970-01-01').getTime();
                        break;
                    default:
                        aValue = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
                        bValue = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [events, filterStatus, sortConfig]);

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvents = processedEvents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedEvents.length / itemsPerPage);

    const getStatusColor = (status) => {
        if (settings && settings.statusColors && settings.statusColors[status]) {
            return settings.statusColors[status];
        }
        switch (status) {
            case 'Confirmado': return 'bg-blue-100 text-blue-700';
            case 'Pago': return 'bg-emerald-100 text-emerald-700';
            case 'Realizado & Pagado': return 'bg-purple-100 text-purple-700';
            case 'Cancelado': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Confirmado': return <CheckCircle size={14} />;
            case 'Pago': return <DollarSign size={14} />;
            case 'Realizado & Pagado': return <CheckSquare size={14} />;
            case 'Cancelado': return <X size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible animate-in fade-in duration-300 relative">
            {/* Header con Filtros */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sm:flex-row flex-col gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Botón Configurar Columnas */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnConfig(!showColumnConfig)}
                            className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition flex items-center gap-2 text-xs font-medium"
                            title="Configurar Columnas"
                        >
                            <Columns size={16} /> Columnas ({visibleColumns.length})
                        </button>

                        {showColumnConfig && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowColumnConfig(false)}></div>
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
                                    <div className="text-xs font-bold text-slate-500 uppercase px-2 py-1 mb-2 border-b">Mostrar Campos</div>
                                    <div className="grid grid-cols-1 gap-1">
                                        {ALL_COLUMNS.map(col => (
                                            <label key={col.key} className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm ${col.required ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.includes(col.key)}
                                                    onChange={() => !col.required && toggleColumn(col.key)}
                                                    disabled={col.required}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                                />
                                                <span className="text-slate-700">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-300 mx-2 hidden sm:block"></div>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Filter size={18} />
                        <span className="font-semibold text-sm hidden sm:inline">Estado:</span>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                    {['Todos', 'Cotizado', 'Confirmado', 'Pago', 'Realizado & Pagado', 'Cancelado'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filterStatus === status
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs sticky top-0 z-0">
                        <tr>
                            {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                                <th
                                    key={col.key}
                                    className={`p-4 ${col.key === 'total' || col.key === 'acciones' ? 'text-right' : ''} ${col.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''}`}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className={`flex items-center gap-1 ${col.key === 'total' || col.key === 'acciones' ? 'justify-end' : ''}`}>
                                        {col.label}
                                        {col.sortable && (
                                            <span className="text-slate-400">
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-indigo-600" /> : <ChevronDown size={14} className="text-indigo-600" />
                                                ) : (
                                                    <ArrowUpDown size={12} className="opacity-0 hover:opacity-50" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentEvents.length > 0 ? (
                            currentEvents.map(event => (
                                <tr key={event.id} className="hover:bg-slate-50 transition">
                                    {visibleColumns.includes('nombre') && (
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{event.nombreEvento || 'Evento Sin Nombre'}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1"><User size={10} /> {event.cliente}</div>
                                        </td>
                                    )}
                                    {visibleColumns.includes('fecha') && (
                                        <td className="p-4">
                                            <div className="text-slate-700 font-medium">{event.fecha}</div>
                                            {!visibleColumns.includes('lugar') && <div className="text-xs text-slate-400">{event.lugar}</div>}
                                        </td>
                                    )}
                                    {visibleColumns.includes('estado') && (
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(event.estado)}`}>
                                                {getStatusIcon(event.estado)}
                                                {event.estado}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.includes('lugar') && <td className="p-4 text-slate-600">{event.lugar || '-'}</td>}
                                    {visibleColumns.includes('direccion') && <td className="p-4 text-slate-600 text-xs truncate max-w-[150px]" title={event.direccion}>{event.direccion || '-'}</td>}
                                    {visibleColumns.includes('telefono') && <td className="p-4 text-slate-600">{event.telefono || event.clienteTelefono || '-'}</td>}
                                    {visibleColumns.includes('organizador') && <td className="p-4 text-slate-600">{event.organizador && event.organizador !== event.cliente ? event.organizador : '-'}</td>}

                                    {visibleColumns.includes('fechaCotizacion') && <td className="p-4 text-slate-500 text-xs">{event.fechaCotizacion || '-'}</td>}
                                    {visibleColumns.includes('cotizacionEnviada') && (
                                        <td className="p-4">
                                            {event.cotizacionEnviada ?
                                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100">ENVIADA</span> :
                                                <span className="text-slate-400 text-[10px]">Pendiente</span>
                                            }
                                        </td>
                                    )}

                                    {visibleColumns.includes('fechaValidez') && <td className="p-4 text-slate-500 text-xs">{event.fechaValidez || '-'}</td>}
                                    {visibleColumns.includes('horaEntrega') && <td className="p-4 text-slate-500 text-xs">{event.horaEntrega || '-'}</td>}
                                    {visibleColumns.includes('fechaRecogida') && <td className="p-4 text-slate-500 text-xs">{event.fechaRecogida || '-'}</td>}
                                    {visibleColumns.includes('horaRecogida') && <td className="p-4 text-slate-500 text-xs">{event.horaRecogida || '-'}</td>}

                                    {visibleColumns.includes('total') && (
                                        <td className="p-4 text-right font-bold text-slate-700">
                                            {formatCurrency.format(event.totalGeneral)}
                                        </td>
                                    )}

                                    {visibleColumns.includes('costoTransporte') && <td className="p-4 text-slate-500 text-xs">{formatCurrency.format(event.costoTransporte || 0)}</td>}
                                    {visibleColumns.includes('depositoSeguridad') && <td className="p-4 text-slate-500 text-xs">{formatCurrency.format(event.depositoSeguridad || 0)}</td>}

                                    {visibleColumns.includes('fechaPago') && <td className="p-4 text-slate-600 text-xs">{event.fechaPago || '-'}</td>}
                                    {visibleColumns.includes('comprobantePago') && <td className="p-4 text-slate-600 text-xs font-mono">{event.comprobantePago || '-'}</td>}

                                    {visibleColumns.includes('notas') && (
                                        <td className="p-4 text-slate-400 text-xs italic truncate max-w-[150px]" title={event.notas}>
                                            {event.notas || '-'}
                                        </td>
                                    )}

                                    {visibleColumns.includes('acciones') && (
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(event)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(event)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={visibleColumns.length} className="p-8 text-center text-slate-500">
                                    No se encontraron eventos con el filtro seleccionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Paginación */}
            <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                <span className="text-xs text-slate-500">
                    Mostrando {currentEvents.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, processedEvents.length)} de {processedEvents.length}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="flex items-center px-2 text-xs font-medium text-slate-600">
                        Pág {currentPage} de {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventListView;
