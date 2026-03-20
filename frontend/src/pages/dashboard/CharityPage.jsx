import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { charitiesAPI, usersAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

export default function CharityPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState(null);
  const [percent, setPercent]     = useState(10);
  const { user, refreshUser }     = useAuthStore();

  useEffect(() => {
    charitiesAPI.getAll().then(({ data }) => setCharities(data.charities || [])).catch(() => {}).finally(() => setLoading(false));
    if (user?.charity?.charityId) {
      setSelected(typeof user.charity.charityId === 'object' ? user.charity.charityId._id : user.charity.charityId);
      setPercent(user.charity.contributionPercent || 10);
    }
  }, []);

  const save = async () => {
    if (!selected) { toast.error('Please select a charity'); return; }
    setSaving(true);
    try {
      await usersAPI.updateCharity({ charityId: selected, contributionPercent: percent });
      await refreshUser();
      toast.success('Charity updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Choose Your Charity</h1>
        <p className="text-dark-300 font-body text-sm">A portion of your subscription goes directly to your chosen charity every month.</p>
      </motion.div>

      {/* Contribution slider */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-white text-sm">Contribution %</h2>
          <span className="font-display font-bold text-2xl text-brand-400">{percent}%</span>
        </div>
        <input type="range" min="10" max="100" step="5" value={percent}
          onChange={(e) => setPercent(parseInt(e.target.value))}
          className="w-full accent-brand-500" />
        <div className="flex justify-between text-dark-400 text-xs font-body mt-1">
          <span>Min 10%</span><span>Max 100%</span>
        </div>
        <p className="text-dark-400 text-xs font-body mt-3">
          At {percent}%, ~£{((percent / 100) * 19.99).toFixed(2)}/month goes to your charity (based on monthly plan).
        </p>
      </motion.div>

      {/* Charity grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {charities.map((c, i) => (
            <motion.button key={c._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(c._id)}
              className={`text-left glass rounded-2xl p-5 transition-all border ${
                selected === c._id ? 'border-brand-500/50 bg-brand-500/8' : 'border-white/8 hover:border-white/20'
              }`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold font-display flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-white text-sm">{c.name}</div>
                  <div className="text-dark-400 text-xs font-body truncate mt-0.5">{c.shortDesc}</div>
                  {c.isFeatured && <span className="text-xs text-brand-400 font-sans mt-1 inline-block">Featured</span>}
                </div>
                {selected === c._id && <span className="text-brand-400 flex-shrink-0">✓</span>}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <button onClick={save} disabled={saving || !selected} className="btn-brand w-full py-3 disabled:opacity-60">
        {saving ? 'Saving…' : 'Save charity selection'}
      </button>
    </div>
  );
}
