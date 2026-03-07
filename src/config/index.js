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
  }
};
