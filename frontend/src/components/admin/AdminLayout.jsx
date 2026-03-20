import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin',             label: 'Dashboard',  icon: '⬡', exact: true },
  { to: '/admin/users',       label: 'Users',       icon: '◎' },
  { to: '/admin/draws',       label: 'Draws',       icon: '🎯' },
  { to: '/admin/winners',     label: 'Winners',     icon: '🏆' },
  { to: '/admin/charities',   label: 'Charities',   icon: '♥' },
];

function AdminSidebar({ isActive, user, onLogout, onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 h-16 flex items-center border-b border-white/5">
        <Link to="/admin" onClick={onClose} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold font-sans text-xs">A</div>
          <span className="font-display font-bold text-white text-sm">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon, exact }) => (
          <Link key={to} to={to} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-body
              ${isActive(to, exact) ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'text-dark-200 hover:bg-white/5 hover:text-white'}`}>
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </Link>
        ))}
        <div className="pt-4 border-t border-white/5 mt-4">
          <Link to="/dashboard" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-300 hover:bg-white/5 hover:text-white transition-all font-body">
            <span className="text-base w-5 text-center">←</span>
            User Dashboard
          </Link>
        </div>
      </nav>
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-sans text-sm flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-body font-medium truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-purple-400 text-xs font-body">Admin</div>
          </div>
          <button onClick={onLogout} className="text-dark-400 hover:text-red-400 text-xs transition-colors">✕</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  const isActive = (to, exact) => exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-dark-800 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 fixed top-0 bottom-0 left-0 z-40"
        style={{ background: 'rgba(10,10,10,0.97)' }}>
        <AdminSidebar isActive={isActive} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/70 z-40 lg:hidden" />
            <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-50 lg:hidden border-r border-white/5"
              style={{ background: 'rgba(10,10,10,0.99)' }}>
              <AdminSidebar isActive={isActive} user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/5"
          style={{ background: 'rgba(10,10,10,0.97)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-white/10">
            <span className="block w-5 h-0.5 bg-white/70 mb-1" /><span className="block w-5 h-0.5 bg-white/70 mb-1" /><span className="block w-5 h-0.5 bg-white/70" />
          </button>
          <span className="font-display font-bold text-white text-sm">Admin Panel</span>
          <div className="w-9" />
        </div>
        <main className="flex-1 p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
