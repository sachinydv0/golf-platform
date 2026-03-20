import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import { paymentsAPI } from '../../services/api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const FEATURES = [
  'Monthly prize draw entry',
  'Track 5 rolling Stableford scores',
  'Charity contribution (min 10%)',
  'Full score history & draw results',
  'Winner verification & payout system',
  'Email notifications for draw results',
];

const YEARLY_FEATURES = [...FEATURES, 'Priority support', '2 months free vs monthly'];

export default function PricingPage() {
  const [yearly, setYearly]   = useState(false);
  const [loading, setLoading] = useState(null);
  const { token, user }       = useAuthStore();
  const navigate              = useNavigate();

  const handleSubscribe = async (plan) => {
    if (!token) { navigate('/register'); return; }
    if (user?.subscription?.status === 'active') {
      toast.error('You already have an active subscription. Manage it in your dashboard.');
      return;
    }
    setLoading(plan);
    try {
      const { data } = await paymentsAPI.createCheckout(plan);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 py-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <motion.div {...fadeUp()} className="text-center mb-16">
          <span className="section-tag mb-4">Pricing</span>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-white mt-4 mb-4">
            Simple, transparent<br />pricing
          </h1>
          <p className="text-dark-200 text-lg font-body max-w-lg mx-auto">
            One platform. Monthly draws. Charity impact. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-body ${!yearly ? 'text-white' : 'text-dark-300'}`}>Monthly</span>
            <button onClick={() => setYearly(!yearly)}
              className="relative w-14 h-7 rounded-full border border-white/10 transition-colors"
              style={{ background: yearly ? '#00cc7f' : '#1e1e1e' }}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${yearly ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-body ${yearly ? 'text-white' : 'text-dark-300'}`}>
              Yearly
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-brand-500/20 text-brand-400 font-sans">Save 17%</span>
            </span>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Monthly */}
          <motion.div {...fadeUp(0.1)} className="glass rounded-2xl p-8 border border-white/8">
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-white mb-1">Monthly</h2>
              <p className="text-dark-300 text-sm font-body">Flexible, cancel anytime</p>
            </div>
            <div className="flex items-end gap-1 mb-6">
              <span className="font-display font-extrabold text-5xl text-white">£19</span>
              <span className="font-display font-bold text-2xl text-white">.99</span>
              <span className="text-dark-300 text-sm mb-1 font-body">/month</span>
            </div>
            <button onClick={() => handleSubscribe('monthly')} disabled={loading === 'monthly'}
              className="btn-ghost w-full mb-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading === 'monthly' ? 'Redirecting…' : 'Subscribe monthly'}
            </button>
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-dark-200 text-sm font-body">
                  <span className="text-brand-400 flex-shrink-0 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Yearly */}
          <motion.div {...fadeUp(0.15)}
            className="rounded-2xl p-8 relative overflow-hidden border border-brand-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(0,204,127,0.1), rgba(0,204,127,0.03))' }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold font-sans bg-brand-500 text-dark-900">
              Best Value
            </div>
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-white mb-1">Yearly</h2>
              <p className="text-dark-300 text-sm font-body">2 months free, billed annually</p>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-display font-extrabold text-5xl text-white">£199</span>
              <span className="text-dark-300 text-sm mb-1 font-body">/year</span>
            </div>
            <p className="text-dark-400 text-xs mb-6 font-body">≈ £16.58/month · saves £40.88/year</p>
            <button onClick={() => handleSubscribe('yearly')} disabled={loading === 'yearly'}
              className="btn-brand w-full mb-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading === 'yearly' ? 'Redirecting…' : 'Subscribe yearly'}
            </button>
            <ul className="space-y-3">
              {YEARLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-dark-200 text-sm font-body">
                  <span className="text-brand-400 flex-shrink-0 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* FAQ strip */}
        <motion.div {...fadeUp(0.2)} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { q: 'Cancel anytime?', a: 'Yes. Cancel from your dashboard — access continues until period end.' },
            { q: 'When are draws?', a: 'Once per month. Admin publishes results and winners are notified by email.' },
            { q: 'Charity split?', a: 'Minimum 10% of your fee goes to your chosen charity. You can increase this.' },
          ].map(({ q, a }) => (
            <div key={q} className="glass rounded-xl p-6">
              <h4 className="font-display font-semibold text-white text-sm mb-2">{q}</h4>
              <p className="text-dark-300 text-xs leading-relaxed font-body">{a}</p>
            </div>
          ))}
        </motion.div>

        {/* Already subscribed */}
        {user?.subscription?.status === 'active' && (
          <motion.div {...fadeUp(0.25)} className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 text-brand-400 text-sm font-body"
              style={{ background: 'rgba(0,204,127,0.08)' }}>
              ✓ You have an active subscription ·{' '}
              <Link to="/dashboard/subscription" className="underline">Manage it</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
