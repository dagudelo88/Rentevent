import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-6 py-4 shadow-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition">
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Acerca de <span className="text-indigo-600">Rentevent</span></h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <p className="text-slate-700 text-lg leading-relaxed">
            Rentevent nació con la misión de transformar la manera en que las agencias de eventos y alquiler de mobiliario gestionan su operación del día a día.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            Nuestra plataforma integra las mejores prácticas operativas y de control de inventario, sumando un potente análisis de datos que te ayuda a identificar <strong>la verdadera rentabilidad</strong> de cada artículo en tu bodega.
          </p>
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-xl mb-4">¿Por qué elegirnos?</h3>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Módulo avanzado de cotizaciones e historial de estado.</li>
              <li>Sistema automatizado de disponibilidad e inventario real.</li>
              <li>Clasificación (Meta-Score) de artículos para priorizar compras e inversiones.</li>
              <li>Arquitectura de datos segura y escalable en la nube.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
