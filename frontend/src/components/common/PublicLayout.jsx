import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import useAuthStore from '../../context/authStore';

const navLinks = [
  { to: '/charities', label: 'Charities' },
  { to: '/draws',     label: 'Draws' },
  { to: '/pricing',   label: 'Pricing' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, token, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-dark-800">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-dark-900 font-bold font-sans text-sm transition-all group-hover:scale-110 group-hover:rotate-3">
              G
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight hidden sm:block">
              GolfCharity
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`nav-link ${location.pathname === to ? 'text-brand-400' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="btn-ghost py-2 px-4 text-xs">
                  {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button onClick={logout} className="nav-link text-xs">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-ghost py-2 px-4 text-xs">Login</Link>
                <Link to="/register" className="btn-brand py-2 px-4 text-xs">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10">
            <span className={`block h-0.5 w-5 bg-white/70 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white/70 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white/70 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/5 overflow-hidden">
              <div className="px-6 py-4 flex flex-col gap-4" style={{ background: 'rgba(13,13,13,0.95)' }}>
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="nav-link text-base">{label}</Link>
                ))}
                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  {token ? (
                    <>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-ghost text-center">Dashboard</Link>
                      <button onClick={() => { logout(); setMenuOpen(false); }} className="nav-link text-center">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-ghost text-center">Login</Link>
                      <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-brand text-center">Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-dark-900 font-bold font-sans text-sm">G</div>
                <span className="font-display font-bold text-white">GolfCharity</span>
              </div>
              <p className="text-dark-200 text-sm leading-relaxed max-w-xs font-body">
                Combining the joy of golf with meaningful charitable impact. Every subscription, every score, every draw — for a better world.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm mb-3">Platform</h4>
              <ul className="space-y-2">
                {[['/', 'Home'], ['/pricing', 'Pricing'], ['/draws', 'Draws'], ['/charities', 'Charities']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-dark-300 text-sm hover:text-brand-400 transition-colors font-body">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm mb-3">Account</h4>
              <ul className="space-y-2">
                {[['/register', 'Get Started'], ['/login', 'Login'], ['/dashboard', 'Dashboard']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-dark-300 text-sm hover:text-brand-400 transition-colors font-body">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-dark-400 text-xs font-body">© {new Date().getFullYear()} GolfCharity Platform. All rights reserved.</p>
            <p className="text-dark-400 text-xs font-body">Compete. Give. Win.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
