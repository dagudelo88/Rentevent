import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  // Support ?tab=register query param from landing page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'register') {
      setIsLogin(false);
    }
    // Pre-fill invite code if provided in URL
    const code = params.get('code');
    if (code) setInviteCode(code.toUpperCase());
  }, [location.search]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate(from, { replace: true });
      } else {
        // Validate required fields
        if (!inviteCode.trim()) throw new Error('Debes ingresar un código de invitación válido.');
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');

        // 1. Validate invite code (RPC is security definer — no auth needed)
        const { data: isValid, error: validationError } = await supabase.rpc(
          'validate_invite_code',
          { code_str: inviteCode.trim().toUpperCase() }
        );
        if (validationError) throw validationError;
        if (!isValid) throw new Error('Código de invitación inválido, expirado o ya utilizado.');

        // 2. Create the account with a proper user-chosen password
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // 3. Mark the invite code as consumed (security definer — runs even before email confirmation)
          await supabase.rpc('use_invite_code', { code_str: inviteCode.trim().toUpperCase() });

          // Supabase may require email confirmation depending on project settings
          if (signUpData.session) {
            navigate('/app', { replace: true });
          } else {
            setSuccess('Cuenta creada. Revisa tu correo para confirmar tu dirección antes de iniciar sesión.');
            setIsLogin(true);
          }
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
      options: { redirectTo: `${window.location.origin}/app` },
    });
  };

  const switchMode = (login) => {
    setIsLogin(login);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

        {/* Logo & back link */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition">
            <ArrowLeft size={16} /> Inicio
          </Link>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3">
            <span className="text-white font-bold text-xl">R</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin
              ? 'Ingresa tus credenciales para continuar'
              : 'Usa tu código de invitación para registrarte'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="tu@correo.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder={isLogin ? '••••••••' : 'Mínimo 8 caracteres'}
                required
                minLength={isLogin ? undefined : 8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Código de Invitación
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="RENT-XXXXXX"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono tracking-widest uppercase"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Código de un solo uso proporcionado por el administrador.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear Cuenta'}
          </button>
        </form>

        {/* OAuth — only show for login */}
        {isLogin && (
          <>
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
          </>
        )}

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </span>
          <button
            onClick={() => switchMode(!isLogin)}
            className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            {isLogin ? 'Regístrate con código' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
