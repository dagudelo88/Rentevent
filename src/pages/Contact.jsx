import React from 'react';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';
import Navbar from '../components/Navbar';
import UnderConstructionBanner from '../components/UnderConstructionBanner';
import { useSiteSettings } from '../hooks/useSiteSettings';

const WHATSAPP_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Contact() {
  const { contact: { phone, whatsapp, email, address, instagram } } = useSiteSettings();

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <UnderConstructionBanner />

      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Contáctanos
            </h1>
            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
              ¿Tienes preguntas o quieres cotizar tu evento? Escríbenos, con gusto te ayudamos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {contactItems.map(({ icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"
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

          <div className="text-center">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-100 transition"
            >
              {WHATSAPP_ICON}
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
