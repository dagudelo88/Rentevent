import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { config } from '../config';
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
      {/* Image or category fallback */}
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
    </section>
  );
}

function ContactSection() {
  const { phone, whatsapp, email, address, instagram } = config.contact;

  const contactItems = [
    {
      icon: <Phone size={20} />,
      label: 'Teléfono',
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    },
    {
      icon: <Mail size={20} />,
      label: 'Correo',
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: <MapPin size={20} />,
      label: 'Ubicación',
      value: address,
      href: null,
    },
    {
      icon: <Instagram size={20} />,
      label: 'Instagram',
      value: instagram,
      href: `https://instagram.com/${instagram.replace('@', '')}`,
    },
  ];

  return (
    <section id="contacto" className="bg-white px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Contáctanos
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            ¿Tienes preguntas o quieres cotizar tu evento? Escríbenos, con gusto te ayudamos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {contactItems.map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 font-semibold hover:text-indigo-600 transition text-sm"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-slate-800 font-semibold text-sm">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-100 transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white/90 backdrop-blur px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Rentevent
          </span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-3">
          <a href="#catalogo" className="hidden sm:inline text-slate-600 hover:text-indigo-600 font-medium transition px-2 py-1 text-sm">
            Catálogo
          </a>
          <Link to="/about" className="hidden sm:inline text-slate-600 hover:text-indigo-600 font-medium transition px-2 py-1 text-sm">
            Nosotros
          </Link>
          <a href="#contacto" className="hidden sm:inline text-slate-600 hover:text-indigo-600 font-medium transition px-2 py-1 text-sm">
            Contacto
          </a>
          <Link
            to={user ? '/app' : '/auth/signin'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
          >
            {user ? 'Dashboard' : 'Ingresar'}
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 overflow-hidden">
          {/* Decorative background blobs */}
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
            <a
              href="#contacto"
              className="flex items-center gap-2 px-8 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition font-bold text-base"
            >
              Cotizar ahora
            </a>
          </div>

          <a href="#catalogo" className="relative mt-14 text-slate-300 hover:text-indigo-400 transition animate-bounce" aria-label="Ver catálogo">
            <ChevronDown size={28} />
          </a>
        </section>

        <CatalogSection />
        <ContactSection />
      </main>

      <footer className="bg-white py-6 text-center text-slate-400 text-xs border-t border-slate-100">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
