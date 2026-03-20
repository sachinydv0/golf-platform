import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={<>Don't have an account? <Link to="/register" className="text-brand-400 hover:text-brand-300">Sign up</Link></>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-dark-200 text-xs font-body mb-1.5">Email</label>
          <input type="email" required autoComplete="email" placeholder="you@example.com"
            className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-dark-200 text-xs font-body mb-1.5">Password</label>
          <input type="password" required autoComplete="current-password" placeholder="••••••••"
            className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="btn-brand w-full py-3 mt-2 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const res = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
    if (res.success) {
      toast.success('Account created! Choose a subscription to get started.');
      navigate('/pricing');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start competing, giving, and winning"
      footer={<>Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link></>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-dark-200 text-xs font-body mb-1.5">First name</label>
            <input type="text" required placeholder="John" className="input" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div>
            <label className="block text-dark-200 text-xs font-body mb-1.5">Last name</label>
            <input type="text" required placeholder="Smith" className="input" value={form.lastName} onChange={set('lastName')} />
          </div>
        </div>
        <div>
          <label className="block text-dark-200 text-xs font-body mb-1.5">Email</label>
          <input type="email" required autoComplete="email" placeholder="you@example.com" className="input" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="block text-dark-200 text-xs font-body mb-1.5">Password</label>
          <input type="password" required autoComplete="new-password" placeholder="Min 6 characters" className="input" value={form.password} onChange={set('password')} />
        </div>
        <div>
          <label className="block text-dark-200 text-xs font-body mb-1.5">Confirm password</label>
          <input type="password" required placeholder="••••••••" className="input" value={form.confirmPassword} onChange={set('confirmPassword')} />
        </div>
        <p className="text-dark-400 text-xs font-body">
          By signing up you agree to our terms. A subscription is needed to participate in draws.
        </p>
        <button type="submit" disabled={loading} className="btn-brand w-full py-3 disabled:opacity-60">
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,204,127,0.08) 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-dark-900 font-bold font-sans">G</div>
          <span className="font-display font-bold text-xl text-white">GolfCharity</span>
        </Link>

        <div className="glass rounded-2xl p-8 border border-white/8">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-white mb-1">{title}</h1>
            <p className="text-dark-300 text-sm font-body">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="text-center text-dark-400 text-sm mt-6 font-body">{footer}</p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
