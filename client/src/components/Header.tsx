import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { AuthModal } from './memories/AuthModal';

export const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useUserAuth();

  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Invitations', href: '/templates' },
    { label: 'Tarifs', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e7ddd3]/60 bg-[#fffdf9]/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to="/" className="text-xl font-black tracking-[0.28em] text-[#2d241e]">
            INVLY
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5c4a3d] md:flex">
            {navItems.map(item => (
              <Link
                key={item.label}
                to={item.href}
                className={`relative py-1 transition-colors ${
                  isActive(item.href)
                    ? 'text-[#8a6a4a] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#8a6a4a] after:content-[""]'
                    : 'hover:text-[#8a6a4a]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              /* Logged-in user menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 rounded-full border border-[#e7ddd3] bg-white px-3 py-2 text-sm font-medium text-[#2d241e] shadow-sm transition hover:border-[#c9b89f] hover:shadow-md"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0e8df] text-[#8a6a4a]">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:block">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 text-[#9c8070] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-[#e7ddd3] bg-white shadow-xl">
                      <div className="border-b border-[#f0e8df] px-4 py-3">
                        <p className="text-xs text-[#9c8070]">Connecté en tant que</p>
                        <p className="truncate text-sm font-semibold text-[#2d241e]">{user.name}</p>
                        <p className="truncate text-xs text-[#9c8070]">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Auth buttons */
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#5c4a3d] transition hover:bg-[#f0e8df] hover:text-[#2d241e]"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="rounded-full bg-[#2d241e] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#453a33] hover:shadow-lg"
                >
                  S'inscrire
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e7ddd3] bg-white text-[#2d241e] shadow-sm transition hover:border-[#c9b89f] md:hidden"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-[#f1e7df] bg-[#fffdf9] px-4 py-5 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive(item.href)
                      ? 'bg-[#f0e8df] text-[#8a6a4a]'
                      : 'text-[#5c4a3d] hover:bg-[#f8f1ea]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {!user && (
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                  className="rounded-full border border-[#e7ddd3] px-4 py-2.5 text-sm font-medium text-[#5c4a3d] transition hover:bg-[#f0e8df]"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                  className="rounded-full bg-[#2d241e] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
    </>
  );
};
