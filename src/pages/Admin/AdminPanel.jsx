import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Key, Users, RefreshCw, Plus, CheckCircle, Clock } from 'lucide-react';

export default function AdminPanel() {
  const [codes, setCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Invite Codes
      const { data: codesData, error: codesError } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (codesError) throw codesError;
      setCodes(codesData || []);

      // Fetch Profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Get emails from Supabase generic RPC if possible or we just show IDs since fetching raw emails requires admin auth hooks
      // Wait, standard users can't see emails in public.profiles because it's not mapped.
      // But admins can see profiles. We'll show ID and Role.
      setUsers(profilesData || []);
    } catch (e) {
      console.error(e);
      alert('Error fetching admin data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const code = 'RENT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          // expires_at defaults to +7 days in schema
        });
        
      if (error) throw error;
      await fetchData();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
      await fetchData();
    } catch (e) {
      alert('Error updating user: ' + e.message);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center">Cargando panel de administrador...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Panel de Administración</h1>
          <p className="text-slate-500">Gestiona accesos y usuarios de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INVITE CODES SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Key className="text-indigo-600" /> Códigos de Invitación
            </h2>
            <button
              onClick={generateCode}
              disabled={generating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
            >
              <Plus size={16} /> {generating ? 'Generando...' : 'NUEVO'}
            </button>
          </div>
          
          <div className="space-y-4">
            {codes.length === 0 ? (
              <p className="text-sm text-slate-500">No hay códigos generados.</p>
            ) : (
              codes.map(c => (
                <div key={c.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-mono text-lg font-bold text-slate-800 select-all">{c.code}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} /> Expira: {new Date(c.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    {c.used_by ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Usado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                        Disponible
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* USERS SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Users className="text-indigo-600" /> Usuarios Registrados
            </h2>
            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-slate-700 transition">
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="font-semibold py-3 px-2">ID Usuario</th>
                  <th className="font-semibold py-3 px-2">Rol</th>
                  <th className="font-semibold py-3 px-2">Estado</th>
                  <th className="font-semibold py-3 px-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-slate-500">No hay usuarios.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="border-b border-slate-50 group hover:bg-slate-50 transition">
                      <td className="py-3 px-2 text-xs font-mono text-slate-600" title={u.id}>
                        {u.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-2 text-sm capitalize font-medium">
                        {u.role === 'admin' ? <span className="text-indigo-600">Admin</span> : <span className="text-slate-600">User</span>}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {u.is_active ? (
                          <span className="text-green-600 font-medium">Activo</span>
                        ) : (
                          <span className="text-red-600 font-medium">Inactivo</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          disabled={u.role === 'admin'}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold transition ${
                            u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } disabled:opacity-30`}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
