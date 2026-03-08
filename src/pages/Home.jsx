import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Package, TrendingUp, Key, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [codeValid, setCodeValid] = useState(false);

  const handleValidateCode = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setValidating(true);
    setCodeError(null);
    setCodeValid(false);

    try {
      const { data: isValid, error } = await supabase.rpc('validate_invite_code', {
        code_str: inviteCode.trim().toUpperCase(),
      });

      if (error) throw error;

      if (!isValid) {
        setCodeError('Código inválido, expirado o ya utilizado.');
      } else {
        setCodeValid(true);
        // Short delay so user sees the green confirmation, then redirect
        setTimeout(() => {
          navigate(`/auth/signin?tab=register&code=${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
        }, 800);
      }
    } catch (err) {
      setCodeError(err.message || 'Error al validar el código.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3">
            <span className="text-white font-bold text-lg md:text-xl">R</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            Rentevent
          </h1>
        </div>

        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-slate-600 hover:text-indigo-600 font-medium transition hidden sm:inline">
            Nosotros
          </Link>
          <Link
            to={user ? '/app' : '/auth/signin'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            {user ? 'Dashboard' : 'Ingresar'}
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
            Plataforma de gestión para alquiler de mobiliario
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Gestión Inteligente de{' '}
            <span className="text-indigo-600">Eventos</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Centraliza tu inventario, clientes y cotizaciones en una sola plataforma robusta y fácil de usar.
            Diseñada para agencias y empresas de alquiler de mobiliario para eventos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              to={user ? '/app' : '/auth/signin'}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-bold text-lg shadow-lg"
            >
              {user ? 'Ir al Dashboard' : 'Iniciar Sesión'} <ArrowRight size={20} />
            </Link>
            {!user && (
              <a
                href="#register"
                className="px-8 py-3 border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-bold text-lg"
              >
                Tengo un código
              </a>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="bg-white px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-center text-2xl font-black text-slate-800 mb-10">
              Todo lo que necesitas en un solo lugar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Package size={24} />,
                  title: 'Inventario Real',
                  desc: 'Controla la disponibilidad de tus artículos, despachos y rentabilidad por producto.',
                },
                {
                  icon: <Calendar size={24} />,
                  title: 'Gestión de Eventos',
                  desc: 'Crea cotizaciones y convierte prospectos en eventos confirmados fácilmente.',
                },
                {
                  icon: <TrendingUp size={24} />,
                  title: 'Reportes y Métricas',
                  desc: 'Visualiza el historial de ingresos y el comportamiento de tu mobiliario.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">{title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Register with invite code — shown only to non-authenticated users */}
        {!user && (
          <section id="register" className="px-6 py-20 bg-gradient-to-br from-indigo-50 to-slate-50">
            <div className="max-w-lg mx-auto text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
                <Key size={28} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3">¿Tienes un código de invitación?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Rentevent es una plataforma de acceso cerrado. Para crear tu cuenta necesitas un
                código de invitación válido generado por el administrador.
              </p>

              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
                <form onSubmit={handleValidateCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 text-left">
                      Código de Invitación
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value.toUpperCase());
                        setCodeError(null);
                        setCodeValid(false);
                      }}
                      placeholder="RENT-XXXXXX"
                      className={`w-full border rounded-xl p-4 text-center font-mono text-xl tracking-widest uppercase outline-none transition focus:ring-2 ${
                        codeValid
                          ? 'border-green-400 bg-green-50 ring-green-200'
                          : codeError
                          ? 'border-red-300 bg-red-50 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'
                      }`}
                      required
                    />
                  </div>

                  {codeError && (
                    <p className="text-sm text-red-600 font-medium text-left flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</span>
                      {codeError}
                    </p>
                  )}

                  {codeValid && (
                    <p className="text-sm text-green-600 font-medium text-left flex items-center gap-1.5">
                      <CheckCircle size={16} /> Código válido — redirigiendo...
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={validating || codeValid || !inviteCode.trim()}
                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {validating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>Continuar con el registro <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/auth/signin" className="font-bold text-indigo-600 hover:text-indigo-800 transition">
                    Inicia sesión aquí
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
                <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Los códigos de invitación son de un solo uso y expiran en 7 días. Si tu código
                  no funciona, contacta al administrador para obtener uno nuevo.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white py-6 text-center text-slate-500 text-sm border-t border-slate-200">
        &copy; {new Date().getFullYear()} Rentevent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
