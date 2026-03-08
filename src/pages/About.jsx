import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Truck, HeartHandshake, Package } from 'lucide-react';
import { config } from '../config';

const highlights = [
  {
    icon: <Package size={22} />,
    title: 'Catálogo variado',
    desc: 'Mobiliario, lounge, mantelería, menaje, decoración, estructuras e iluminación para cualquier tipo de evento.',
  },
  {
    icon: <Star size={22} />,
    title: 'Calidad garantizada',
    desc: 'Cada artículo es revisado y mantenido antes de cada entrega para asegurar el mejor estado.',
  },
  {
    icon: <Truck size={22} />,
    title: 'Entrega y recogida',
    desc: 'Nos encargamos del transporte, montaje y desmontaje para que tú solo te preocupes por disfrutar.',
  },
  {
    icon: <HeartHandshake size={22} />,
    title: 'Atención personalizada',
    desc: 'Te asesoramos en la selección de artículos para que tu evento refleje exactamente lo que imaginas.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-6 py-4 shadow-sm border-b border-slate-100 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition text-sm"
        >
          <ArrowLeft size={18} /> Volver al inicio
        </Link>
        <Link
          to="/auth/signin"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
        >
          Ingresar
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-16">
        <h1 className="text-4xl font-black text-slate-900 mb-3">
          Acerca de <span className="text-indigo-600">Rentevent</span>
        </h1>
        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
          Somos una empresa dedicada al alquiler de mobiliario y decoración para eventos sociales y corporativos.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5 mb-10">
          <p className="text-slate-700 text-base leading-relaxed">
            En <strong>Rentevent</strong> creemos que cada celebración merece el escenario perfecto.
            Nacimos con la misión de hacer accesible el mobiliario de calidad para bodas, quinceañeros,
            eventos corporativos, fiestas y cualquier ocasión especial.
          </p>
          <p className="text-slate-700 text-base leading-relaxed">
            Contamos con un amplio catálogo de artículos —desde sillas y mesas hasta estructuras
            de iluminación y piezas de lounge— cuidadosamente seleccionados para ofrecerte
            estilo, comodidad y durabilidad.
          </p>
          <p className="text-slate-700 text-base leading-relaxed">
            Nuestro equipo acompaña cada proyecto desde la cotización hasta la recogida final,
            asegurando una experiencia sin complicaciones para ti y tus invitados.
          </p>
        </div>

        {/* Highlights grid */}
        <h2 className="text-xl font-black text-slate-800 mb-6">¿Por qué elegirnos?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {highlights.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-4"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1 text-sm">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-black mb-2">¿Listo para planear tu evento?</h3>
          <p className="text-indigo-200 text-sm mb-6">
            Explora nuestro catálogo y contáctanos para recibir una cotización personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/#catalogo"
              className="px-6 py-2.5 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition text-sm"
            >
              Ver catálogo
            </Link>
            <a
              href={`https://wa.me/${config.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 border border-indigo-400 transition text-sm"
            >
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-white py-5 text-center text-slate-400 text-xs border-t border-slate-100">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
