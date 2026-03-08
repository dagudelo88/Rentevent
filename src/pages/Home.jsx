import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { CATEGORIES, CATEGORY_STYLES, DEFAULT_CATEGORY_STYLE } from '../constants/inventory';

const ALL_FILTER = 'Todos';

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductCard({ product }) {
  const style = CATEGORY_STYLES[product.categoria] ?? DEFAULT_CATEGORY_STYLE;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-full aspect-[4/3] bg-gradient-to-br ${style.gradient} flex items-center justify-center overflow-hidden`}>
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl select-none" aria-hidden="true">{style.emoji}</span>
        )}
      </div>

      <div className="p-4">
        <span className="inline-block text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
          {product.categoria}
        </span>
        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">
          {product.nombre}
        </h3>
        <p className="text-indigo-700 font-black text-base">
          {formatPrice(product.precio_alquiler)}
          <span className="text-slate-400 font-normal text-xs ml-1">/ evento</span>
        </p>
      </div>
    </div>
  );
}

function CatalogSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('inventario')
        .select('id, nombre, categoria, precio_alquiler, imagen_url')
        .order('categoria')
        .order('nombre');

      if (!error && data) setProducts(data);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filters = [ALL_FILTER, ...CATEGORIES];
  const visible =
    activeCategory === ALL_FILTER
      ? products
      : products.filter((p) => p.categoria === activeCategory);

  return (
    <section id="catalogo" className="bg-slate-50 px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Nuestro <span className="text-indigo-600">Catálogo</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Explora todo lo que tenemos disponible para hacer tu evento único e inolvidable.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {filters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin mr-3" />
            <span className="text-sm font-medium">Cargando catálogo...</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            No hay productos disponibles en esta categoría por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 overflow-hidden">
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
            <a
              href="#catalogo"
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-base shadow-lg shadow-indigo-200"
            >
              Ver catálogo <ArrowRight size={18} />
            </a>
            <Link
              to="/contacto"
              className="flex items-center gap-2 px-8 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition font-bold text-base"
            >
              Cotizar ahora
            </Link>
          </div>

          <a href="#catalogo" className="relative mt-14 text-slate-300 hover:text-indigo-400 transition animate-bounce" aria-label="Ver catálogo">
            <ChevronDown size={28} />
          </a>
        </section>

        <CatalogSection />
      </main>

      <footer className="bg-white py-6 text-center text-slate-400 text-xs border-t border-slate-100">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
