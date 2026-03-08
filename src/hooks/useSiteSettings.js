import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CONTACT_KEY = 'contact';

/** Fallback shown while the DB fetch is in-flight or if it fails. */
export const DEFAULT_CONTACT = {
  phone:     '+57 300 000 0000',
  whatsapp:  '573000000000',
  email:     'info@rentevent.co',
  address:   'Bogotá, Colombia',
  instagram: '@rentevent',
};

/**
 * Reads and (for admins) writes site-wide settings stored in the
 * `site_settings` table.
 *
 * The table is publicly readable so the homepage can display contact
 * information to anonymous visitors without authentication.
 */
export function useSiteSettings() {
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', CONTACT_KEY)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else if (data?.value) {
        setContact(data.value);
      }

      setLoading(false);
    }

    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  /**
   * Persists updated contact info. Only callable by authenticated admins
   * (enforced by the RLS policy on site_settings).
   *
   * @param {typeof DEFAULT_CONTACT} newContact
   * @returns {{ error: string | null }}
   */
  const saveContact = async (newContact) => {
    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase
      .from('site_settings')
      .upsert({ key: CONTACT_KEY, value: newContact });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return { error: saveError.message };
    }

    setContact(newContact);
    return { error: null };
  };

  return { contact, loading, saving, error, saveContact };
}
