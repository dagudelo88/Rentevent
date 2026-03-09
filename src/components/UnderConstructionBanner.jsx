import React from 'react';
import { Construction } from 'lucide-react';

/**
 * Banner to signal that the site is still under construction.
 * Displays a subtle, non-intrusive notice matching the site's design language.
 */
export default function UnderConstructionBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-50 border-b border-amber-200/80"
      role="status"
      aria-label="Sitio en construcción"
    >
      <Construction
        size={16}
        className="text-amber-600 shrink-0 animate-pulse"
        aria-hidden
      />
      <span className="text-amber-800 text-sm font-medium">
        Sitio en construcción — Estamos mejorando tu experiencia
      </span>
    </div>
  );
}
