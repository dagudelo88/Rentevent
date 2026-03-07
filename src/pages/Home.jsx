import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3">
            <span className="text-white font-bold text-lg md:text-xl">R</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Rentevent
          </h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-slate-600 hover:text-indigo-600 font-medium transition">
            Nosotros
          </Link>
          <Link to="/auth/signin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
            Ingresar
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Gestión Inteligente de <span className="text-indigo-600">Eventos</span>
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Centraliza tu inventario, clientes y cotizaciones en una sola plataforma robusta y fácil de usar. Especialmente diseñada para agencias y alquiler de mobiliario.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Inventario Real</h3>
            <p className="text-slate-600 text-sm">Controla la disponibilidad de tus artículos, despachos y rentabilidad por producto.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gestión de Eventos</h3>
            <p className="text-slate-600 text-sm">Crea cotizaciones y convierte prospectos en eventos confirmados fácilmente.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Reportes y Métricas</h3>
            <p className="text-slate-600 text-sm">Visualiza el historial de ingresos y el comportamiento de tu mobiliario.</p>
          </div>
        </div>

        <div className="mt-12">
          <Link to="/app" className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-bold text-lg shadow-lg">
            Ir al Dashboard
          </Link>
        </div>
      </main>

      <footer className="bg-white py-6 text-center text-slate-500 text-sm border-t border-slate-200">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
