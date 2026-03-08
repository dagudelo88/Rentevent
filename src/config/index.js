// Application Configuration

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  app: {
    name: 'Rentevent',
    defaultQuoteValidity: 15, // days
  },
  roles: {
    ADMIN: 'admin',
    USER: 'user',
  },
  contact: {
    phone: import.meta.env.VITE_CONTACT_PHONE || '+57 300 000 0000',
    whatsapp: import.meta.env.VITE_CONTACT_WHATSAPP || '+573000000000',
    email: import.meta.env.VITE_CONTACT_EMAIL || 'info@rentevent.co',
    address: import.meta.env.VITE_CONTACT_ADDRESS || 'Bogotá, Colombia',
    instagram: import.meta.env.VITE_CONTACT_INSTAGRAM || '@rentevent',
  },
};
