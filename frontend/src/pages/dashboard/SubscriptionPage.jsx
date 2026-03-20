// SubscriptionPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

export function SubscriptionPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const sub = user?.subscription;

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsAPI.createPortal();
      window.location.href = data.url;
    } catch { toast.error('Failed to open billing portal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Subscription</h1>
        <p className="text-dark-300 font-body text-sm">Manage your plan and billing.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className={`glass rounded-2xl p-6 border ${sub?.status === 'active' ? 'border-brand-500/25' : 'border-white/8'}`}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-white text-lg capitalize">{sub?.plan || 'No plan'}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-sans mt-1 inline-block ${
              sub?.status === 'active' ? 'bg-brand-500/15 text-brand-400' :
              sub?.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
              'bg-dark-700 text-dark-300'
            }`}>{sub?.status || 'inactive'}</span>
          </div>
          {sub?.status === 'active' && (
            <div className="text-right">
              <div className="text-dark-400 text-xs font-body">Renews</div>
              <div className="text-white font-body text-sm">
                {sub?.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy') : '—'}
              </div>
            </div>
          )}
        </div>

        {sub?.status === 'active' ? (
          <div className="space-y-3">
            <button onClick={openPortal} disabled={loading} className="btn-ghost w-full py-3 disabled:opacity-60">
              {loading ? 'Opening portal…' : 'Manage billing & cancel →'}
            </button>
            <p className="text-dark-400 text-xs text-center font-body">
              Manage via Stripe's secure billing portal. Changes take effect immediately.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-dark-300 text-sm font-body mb-4">You don't have an active subscription.</p>
            <Link to="/pricing" className="btn-brand w-full py-3 text-center block">Subscribe now →</Link>
          </div>
        )}
      </motion.div>

      {sub?.cancelAtPeriodEnd && (
        <div className="glass rounded-xl p-4 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.06)' }}>
          <p className="text-amber-400 text-sm font-body">
            Your subscription will cancel on {sub?.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy') : '—'}.
            Reactivate from the billing portal to continue.
          </p>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPage;
