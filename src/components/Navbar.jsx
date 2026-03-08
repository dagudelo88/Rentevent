import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Catálogo',  href: '/#catalogo' },
  { label: 'Nosotros',  href: '/about'     },
  { label: 'Contacto',  href: '/#contacto' },
];

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3">
          <span className="text-white font-black text-lg">R</span>
        </div>
        <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
          Rentevent
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 sm:gap-3">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="hidden sm:inline text-slate-600 hover:text-indigo-600 font-medium transition px-2 py-1 text-sm"
          >
            {label}
          </a>
        ))}
        <Link
          to={user ? '/app' : '/auth/signin'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
        >
          {user ? 'Dashboard' : 'Ingresar'}
        </Link>
      </nav>
    </header>
  );
}
