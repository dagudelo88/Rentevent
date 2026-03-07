import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Normal Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
        navigate(from, { replace: true });
        
      } else {
        // Sign Up with Invite Code
        if (!inviteCode) {
          throw new Error('Debes ingresar un código de invitación válido.');
        }

        // 1. Check if valid
        const { data: isValid, error: validationError } = await supabase.rpc('validate_invite_code', { code_str: inviteCode });
        if (validationError) throw validationError;
        if (!isValid) throw new Error('Código de invitación inválido, expirado o ya usado.');

        // 2. We use the invite code as the initial temporary password!
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: inviteCode // User will change this later
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // 3. Consume the code automatically since they are now logged in
          await supabase.rpc('use_invite_code', { code_str: inviteCode });
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3 mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin ? 'Ingresa tus credenciales para continuar' : 'Usa tu código de invitación para registrarte'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
          </div>

          {isLogin ? (
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                 required
               />
             </div>
          ) : (
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Código de Invitación</label>
               <input
                 type="text"
                 value={inviteCode}
                 onChange={(e) => setInviteCode(e.target.value)}
                 placeholder="Ej. RENT-XYZ-123"
                 className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition uppercase"
                 required
               />
               <p className="text-xs text-slate-500 mt-2">El código será tu contraseña temporal. Deberás cambiarla después.</p>
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between before:content-[''] before:flex-1 before:border-t before:border-slate-200 after:content-[''] after:flex-1 after:border-t after:border-slate-200">
          <span className="text-xs text-slate-400 font-bold px-4 uppercase tracking-wider">o continuar con</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="text-sm font-bold text-slate-700">Google</span>
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition"
          >
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5" />
            <span className="text-sm font-bold text-slate-700">GitHub</span>
          </button>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            {isLogin ? 'Usa un código de invitación' : 'Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
