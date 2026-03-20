import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',              label: 'Overview',     icon: '⬡' },
  { to: '/dashboard/scores',       label: 'My Scores',    icon: '⛳', sub: true },
  { to: '/dashboard/draws',        label: 'Draws',        icon: '🎯', sub: true },
  { to: '/dashboard/charity',      label: 'Charity',      icon: '♥' },
  { to: '/dashboard/subscription', label: 'Subscription', icon: '★' },
  { to: '/dashboard/profile',      label: 'Profile',      icon: '◎' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const isActive = (to) => to === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(to);

  const subActive = user?.subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-dark-800 flex">

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 fixed top-0 bottom-0 left-0 z-40"
        style={{ background: 'rgba(10,10,10,0.95)' }}>
        <Sidebar isActive={isActive} subActive={subActive} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden" />
            <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-50 lg:hidden border-r border-white/5"
              style={{ background: 'rgba(10,10,10,0.99)' }}>
              <Sidebar isActive={isActive} subActive={subActive} user={user} onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/5"
          style={{ background: 'rgba(10,10,10,0.95)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-white/10">
            <span className="block w-5 h-0.5 bg-white/70 mb-1" />
            <span className="block w-5 h-0.5 bg-white/70 mb-1" />
            <span className="block w-5 h-0.5 bg-white/70" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-dark-900 font-bold font-sans text-xs">G</div>
            <span className="font-display font-bold text-white text-sm">GolfCharity</span>
          </Link>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ isActive, subActive, user, onLogout, onClose, mobile }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-white/5">
        <Link to="/" onClick={onClose} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-dark-900 font-bold font-sans text-sm">G</div>
          <span className="font-display font-bold text-white">GolfCharity</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon, sub }) => {
          const locked = sub && !subActive;
          const active = isActive(to);
          return (
            <Link key={to} to={locked ? '/pricing' : to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-body
                ${active ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'text-dark-200 hover:bg-white/5 hover:text-white'}
                ${locked ? 'opacity-50' : ''}`}>
              <span className="text-base w-5 text-center">{icon}</span>
              <span className="flex-1">{label}</span>
              {locked && <span className="text-xs text-dark-400">🔒</span>}
            </Link>
          );
        })}

        {/* Admin link */}
        {user?.role === 'admin' && (
          <Link to="/admin" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-purple-400 hover:bg-purple-500/10 transition-all font-body mt-4 border border-purple-500/20">
            <span className="text-base w-5 text-center">⚙</span>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        {/* Subscription badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-body ${
          subActive
            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
            : 'bg-dark-700 text-dark-300 border border-white/5'
        }`}>
          <span>{subActive ? '●' : '○'}</span>
          {subActive ? `${user?.subscription?.plan} plan` : 'No subscription'}
        </div>

        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold font-sans text-sm flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-body font-medium truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-dark-400 text-xs font-body truncate">{user?.email}</div>
          </div>
          <button onClick={onLogout} className="text-dark-400 hover:text-red-400 text-xs transition-colors" title="Logout">✕</button>
        </div>
      </div>
    </div>
  );
}
