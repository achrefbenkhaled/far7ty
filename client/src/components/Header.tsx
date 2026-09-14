import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Invitations', href: '/templates' },
    { label: 'Tarifs', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7ddd3] bg-[#fffdf9]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-black tracking-[0.28em] text-[#2d241e]">
          INVLY
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#5c4a3d] md:flex">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className={`transition ${location.pathname === item.href ? 'text-[#8a6a4a]' : 'hover:text-[#8a6a4a]'}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://wa.me/33600000000?text=Bonjour%20Invly%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20invitations."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1f8f5f] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(31,143,95,0.25)] transition hover:translate-y-[-1px]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e7ddd3] bg-white text-[#2d241e] md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#f1e7df] bg-[#fffdf9] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-[#5c4a3d]">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setOpen(false)} className="py-2">
                {item.label}
              </Link>
            ))}
            <a
              href="https://wa.me/33600000000?text=Bonjour%20Invly%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20invitations."
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#1f8f5f] px-4 py-3 font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
