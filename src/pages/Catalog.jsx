import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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

export default function Catalog() {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              Nuestro <span className="text-indigo-600">Catálogo</span>
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Explora todo lo que tenemos disponible para hacer tu evento único e inolvidable.
            </p>
          </div>

          {/* Category filters */}
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

          {/* Product grid */}
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
      </main>

      <footer className="bg-white py-5 text-center text-slate-400 text-xs border-t border-slate-100">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
