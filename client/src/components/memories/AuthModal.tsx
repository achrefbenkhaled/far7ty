import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** Google "G" logo SVG */
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  icon: Icon,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  icon: React.ElementType;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#7a6152]">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0998a]">
          <Icon className="h-4 w-4" />
        </span>
        <input
          name={name}
          type={inputType}
          required
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#e6d9cc] bg-[#fffcf9] py-3 pl-10 pr-10 text-sm text-[#2d241e] placeholder-[#c0a898] transition focus:border-[#8a6a4a] focus:outline-none focus:ring-2 focus:ring-[#8a6a4a]/20"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0998a] transition hover:text-[#8a6a4a]"
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useUserAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        const name = data.get('name') as string;
        await register(name, email, password);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    // Redirect to backend Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/auth/google`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#1a130e]/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-[#fffdf9] shadow-2xl"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
          >
            {/* Header gradient strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a97c] via-[#8a6a4a] to-[#5c4a3d]" />

            <div className="px-7 py-7">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9c8070] transition hover:bg-[#f0e8df] hover:text-[#5c4a3d]"
                aria-label="Fermer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Branding */}
              <div className="mb-6 text-center">
                <p className="text-2xl font-black tracking-[0.2em] text-[#2d241e]">INVLY</p>
                <p className="mt-1 text-sm text-[#9c8070]">
                  {tab === 'login' ? 'Bon retour parmi nous ✨' : 'Créez votre compte gratuitement'}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex rounded-2xl bg-[#f3ede6] p-1">
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      tab === t
                        ? 'bg-white text-[#2d241e] shadow-sm'
                        : 'text-[#9c8070] hover:text-[#5c4a3d]'
                    }`}
                  >
                    {t === 'login' ? 'Se connecter' : "S'inscrire"}
                  </button>
                ))}
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#e6d9cc] bg-white py-3 text-sm font-semibold text-[#2d241e] shadow-sm transition hover:bg-[#faf7f4] hover:shadow-md disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#9c8070]" />
                ) : (
                  <GoogleIcon />
                )}
                Continuer avec Google
              </button>

              {/* Divider */}
              <div className="relative mb-5 flex items-center gap-3">
                <div className="flex-1 border-t border-[#e6d9cc]" />
                <span className="text-xs font-medium text-[#b0998a]">ou</span>
                <div className="flex-1 border-t border-[#e6d9cc]" />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'register' && (
                  <InputField label="Nom complet" name="name" icon={User} placeholder="Marie Dupont" />
                )}
                <InputField label="Email" name="email" type="email" icon={Mail} placeholder="vous@exemple.com" />
                <InputField label="Mot de passe" name="password" type="password" icon={Lock} placeholder="••••••••" />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d241e] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#453a33] hover:shadow-lg disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading
                    ? 'Chargement…'
                    : tab === 'login'
                    ? 'Se connecter'
                    : 'Créer mon compte'}
                </button>
              </form>

              {/* Footer switch */}
              <p className="mt-5 text-center text-xs text-[#9c8070]">
                {tab === 'login' ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('register'); setError(''); }}
                      className="font-semibold text-[#8a6a4a] underline underline-offset-2 hover:text-[#5c4a3d]"
                    >
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setError(''); }}
                      className="font-semibold text-[#8a6a4a] underline underline-offset-2 hover:text-[#5c4a3d]"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
