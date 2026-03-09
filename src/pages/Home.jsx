import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import UnderConstructionBanner from '../components/UnderConstructionBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <UnderConstructionBanner />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-200 rounded-full opacity-40 blur-3xl" />
        </div>

        <span className="relative inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
          Alquiler de mobiliario para eventos
        </span>
        <h1 className="relative text-4xl md:text-6xl font-black text-slate-900 mb-5 tracking-tight leading-tight max-w-3xl">
          Haz tu evento{' '}
          <span className="text-indigo-600">inolvidable</span>
        </h1>
        <p className="relative text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Contamos con sillas, mesas, decoración, lounge, mantelería y más para que tu celebración sea perfecta.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-3 items-center">
          <Link
            to="/catalogo"
            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-base shadow-lg shadow-indigo-200"
          >
            Ver catálogo <ArrowRight size={18} />
          </Link>
          <Link
            to="/contacto"
            className="flex items-center gap-2 px-8 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition font-bold text-base"
          >
            Cotizar ahora
          </Link>
        </div>
      </main>

      <footer className="bg-white py-6 text-center text-slate-400 text-xs border-t border-slate-100">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
