import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import {
  Key, Users, RefreshCw, Plus, CheckCircle, Clock, Copy, Trash2,
  ArrowLeft, Shield, AlertTriangle, LayoutDashboard, Phone, Mail,
  MapPin, Instagram, Save, Globe, FileText,
} from 'lucide-react';

const CODE_EXPIRY_DAYS = 7;

function Badge({ variant, children }) {
  const styles = {
    used:      'bg-green-100 text-green-700',
    available: 'bg-yellow-100 text-yellow-700',
    expired:   'bg-slate-100 text-slate-500',
    admin:     'bg-indigo-100 text-indigo-700',
    user:      'bg-slate-100 text-slate-600',
    active:    'bg-emerald-100 text-emerald-700',
    inactive:  'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1 ${styles[variant] ?? ''}`}>
      {children}
    </span>
  );
}

const CONTACT_FIELDS = [
  { key: 'phone',     label: 'Teléfono',   icon: <Phone size={16} />,     placeholder: '+57 300 000 0000',  type: 'tel'   },
  { key: 'whatsapp',  label: 'WhatsApp',   icon: <Phone size={16} />,     placeholder: '573000000000',      type: 'tel',  hint: 'Solo números, sin espacios ni +. Ej: 573001234567' },
  { key: 'email',     label: 'Correo',     icon: <Mail size={16} />,      placeholder: 'info@rentevent.co', type: 'email' },
  { key: 'address',   label: 'Dirección',  icon: <MapPin size={16} />,    placeholder: 'Bogotá, Colombia',  type: 'text'  },
  { key: 'instagram', label: 'Instagram',  icon: <Instagram size={16} />, placeholder: '@rentevent',        type: 'text'  },
];

function ContactInfoSection({ showToast }) {
  const { contact, loading, saving, saveContact } = useSiteSettings();
  const [form, setForm] = useState(null);

  // Populate form once the DB value arrives
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setForm(contact), 0);
      return () => clearTimeout(timer);
    }
  }, [loading, contact]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await saveContact(form);
    if (error) showToast('Error al guardar: ' + error, true);
    else showToast('Información de contacto actualizada');
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <Globe size={18} className="text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Información de Contacto del Sitio</h2>
      </div>

      {loading || !form ? (
        <p className="text-center text-sm text-slate-400 py-8">Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {CONTACT_FIELDS.map(({ key, label, icon, placeholder, type, hint }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  {icon} {label}
                </label>
                <input
                  type={type}
                  value={form[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                />
                {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

const PDF_SETTINGS_FIELDS = [
  { key: 'pdfCompanyName', label: 'Nombre Empresa', icon: <Users size={16} />, placeholder: 'Rentevent S.A.S.', type: 'text' },
  { key: 'pdfLogoUrl', label: 'URL del Logo', icon: <Globe size={16} />, placeholder: 'https://...', type: 'url' },
  { key: 'pdfPhone', label: 'Teléfono', icon: <Phone size={16} />, placeholder: '+57 300 000 0000', type: 'tel' },
  { key: 'pdfEmail', label: 'Correo', icon: <Mail size={16} />, placeholder: 'info@rentevent.co', type: 'email' },
  { key: 'pdfAddress', label: 'Dirección', icon: <MapPin size={16} />, placeholder: 'Bogotá, Colombia', type: 'text' },
  { key: 'pdfFooterText', label: 'Texto Pié de Página', icon: <LayoutDashboard size={16} />, placeholder: 'Gracias por preferirnos.', type: 'text' },
  { key: 'pdfDisclaimer', label: 'Términos / Disclaimer', icon: <FileText size={16} />, placeholder: 'Términos y condiciones de la cotización...', type: 'text' },
  { key: 'pdfThemeColor', label: 'Color Tema (Hex)', icon: <LayoutDashboard size={16} />, placeholder: '#4F46E5', type: 'color' },
];

function PdfSettingsSection({ showToast }) {
  const { contact: currentSettings, loading, saving, saveContact } = useSiteSettings();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setForm(currentSettings || {}), 0);
      return () => clearTimeout(timer);
    }
  }, [loading, currentSettings]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await saveContact(form);
    if (error) showToast('Error al guardar configuración de PDF: ' + error, true);
    else showToast('Configuración de PDF actualizada');
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 mt-8">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <LayoutDashboard size={18} className="text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Configuraciones del PDF (Cotizaciones)</h2>
      </div>

      {loading || !form ? (
        <p className="text-center text-sm text-slate-400 py-8">Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {PDF_SETTINGS_FIELDS.map(({ key, label, icon, placeholder, type, hint }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  {icon} {label}
                </label>
                {type === 'color' ? (
                   <div className="flex items-center gap-3">
                     <input
                      type="color"
                      value={form[key] || '#4F46E5'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-10 h-10 border-0 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form[key] || '#4F46E5'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder="#4F46E5"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none uppercase font-mono"
                    />
                   </div>
                ) : (
                  <input
                    type={type}
                    value={form[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                )}
                {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Guardando...' : 'Guardar configuración PDF'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [codes, setCodes]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [codesRes, profilesRes] = await Promise.all([
        supabase
          .from('invite_codes')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, email, role, is_active, created_at')
          .order('created_at', { ascending: false }),
      ]);

      if (codesRes.error) throw codesRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setCodes(codesRes.data ?? []);
      setUsers(profilesRes.data ?? []);
    } catch (e) {
      showToast('Error al cargar datos: ' + e.message, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      // Generate a cryptographically-inspired random code
      const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(36).toUpperCase().padStart(2, '0'))
        .join('')
        .substring(0, 6);
      const code = `RENT-${rand}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + CODE_EXPIRY_DAYS);

      const { error } = await supabase.from('invite_codes').insert({
        code,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;
      showToast(`Código ${code} generado con éxito`);
      await fetchData();
    } catch (e) {
      showToast('Error al generar código: ' + e.message, true);
    } finally {
      setGenerating(false);
    }
  };

  const deleteCode = async (id, code) => {
    if (!window.confirm(`¿Eliminar el código ${code}?`)) return;
    try {
      const { error } = await supabase.from('invite_codes').delete().eq('id', id);
      if (error) throw error;
      showToast('Código eliminado');
      await fetchData();
    } catch (e) {
      showToast('Error al eliminar: ' + e.message, true);
    }
  };

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleUserStatus = async (userId, currentStatus, role) => {
    if (role === 'admin') return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
      if (error) throw error;
      showToast(`Usuario ${!currentStatus ? 'activado' : 'desactivado'}`);
      await fetchData();
    } catch (e) {
      showToast('Error: ' + e.message, true);
    }
  };

  const getCodeStatus = (code) => {
    if (code.used_by) return 'used';
    if (new Date(code.expires_at) < new Date()) return 'expired';
    return 'available';
  };

  const stats = {
    total:     codes.length,
    available: codes.filter((c) => getCodeStatus(c) === 'available').length,
    used:      codes.filter((c) => getCodeStatus(c) === 'used').length,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-lg leading-none">Panel de Administración</h1>
            <p className="text-xs text-slate-400 mt-0.5">Rentevent</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
          >
            <ArrowLeft size={16} /> Inicio
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

        {/* Admin identity banner */}
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3">
          <Shield size={18} className="text-indigo-600 shrink-0" />
          <p className="text-sm text-indigo-700 font-medium">
            Sesión como <strong>Administrador</strong> — {user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Códigos totales',     value: stats.total,       color: 'text-slate-800' },
            { label: 'Disponibles',          value: stats.available,   color: 'text-yellow-600' },
            { label: 'Utilizados',           value: stats.used,        color: 'text-green-600' },
            { label: 'Usuarios activos',     value: `${stats.activeUsers}/${stats.totalUsers}`, color: 'text-indigo-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Invite Codes ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Key size={18} className="text-indigo-600" /> Códigos de Invitación
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  className="p-2 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-50"
                  title="Recargar"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={generateCode}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm disabled:opacity-50"
                >
                  <Plus size={15} /> {generating ? 'Generando...' : 'Nuevo código'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-slate-50 p-2">
              {loading ? (
                <p className="text-center text-sm text-slate-400 py-8">Cargando...</p>
              ) : codes.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  No hay códigos generados. Crea el primero.
                </p>
              ) : (
                codes.map((c) => {
                  const status = getCodeStatus(c);
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-base font-bold text-slate-800 tracking-wider truncate">
                          {c.code}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(c.expires_at) < new Date()
                              ? 'Expiró'
                              : 'Expira'}{' '}
                            {new Date(c.expires_at).toLocaleDateString('es-CO', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                          <Badge variant={status}>
                            {status === 'used' && <><CheckCircle size={11} /> Usado</>}
                            {status === 'available' && 'Disponible'}
                            {status === 'expired' && 'Expirado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {status === 'available' && (
                          <button
                            onClick={() => copyCode(c.id, c.code)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition rounded-lg hover:bg-indigo-50"
                            title="Copiar código"
                          >
                            {copiedId === c.id ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                          </button>
                        )}
                        {status !== 'used' && (
                          <button
                            onClick={() => deleteCode(c.id, c.code)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                            title="Eliminar código"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <p className="text-xs text-slate-400">
                Los códigos expiran automáticamente a los {CODE_EXPIRY_DAYS} días de ser generados.
              </p>
            </div>
          </section>

          {/* ── Users ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Users size={18} className="text-indigo-600" /> Usuarios Registrados
              </h2>
              <button
                onClick={fetchData}
                className="p-2 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-50"
                title="Recargar"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96">
              {loading ? (
                <p className="text-center text-sm text-slate-400 py-8">Cargando...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No hay usuarios registrados.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Usuario</th>
                      <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Rol</th>
                      <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition group">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 truncate max-w-[160px]" title={u.email}>
                            {u.email ?? <span className="text-slate-400 italic">Sin email</span>}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5" title={u.id}>
                            {u.id.substring(0, 8)}…
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === 'admin' ? 'admin' : 'user'}>
                            {u.role === 'admin' ? <><Shield size={10} /> Admin</> : 'Usuario'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.is_active ? 'active' : 'inactive'}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleUserStatus(u.id, u.is_active, u.role)}
                            disabled={u.role === 'admin'}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${
                              u.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title={u.role === 'admin' ? 'No puedes desactivar un administrador' : ''}
                          >
                            {u.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center gap-2">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <p className="text-xs text-slate-400">
                Desactivar un usuario le impide iniciar sesión. Los administradores no pueden desactivarse.
              </p>
            </div>
          </section>

        </div>

        <ContactInfoSection showToast={showToast} />
        
        <PdfSettingsSection showToast={showToast} />

      </div>

      {/* Toast notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all z-50 ${
            toastMsg.isError
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
}
