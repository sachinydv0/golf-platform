// pages/dashboard/MyDrawsPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { drawsAPI } from '../../services/api';

export function MyDrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    drawsAPI.getMyDraws()
      .then(({ data }) => setDraws(data.draws || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">My Draws</h1>
        <p className="text-dark-300 font-body text-sm">Your draw history and winnings.</p>
      </motion.div>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}</div>
      ) : draws.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-30">🎯</div>
          <p className="text-dark-300 font-body">You haven't won any draws yet. Keep your scores updated each month!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display font-bold text-white">{d.month}/{d.year} Draw</div>
                  <div className="text-dark-400 text-xs font-body mt-0.5">
                    {d.publishedAt ? format(new Date(d.publishedAt), 'dd MMM yyyy') : '—'}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {d.drawNumbers?.map(n => (
                      <span key={n} className="text-brand-400 font-mono text-xs bg-brand-500/10 px-2 py-0.5 rounded">{n}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-brand-400 font-display font-bold">
                    £{d.winners?.reduce((s, w) => s + w.prizeAmount, 0).toFixed(2)}
                  </div>
                  <div className="text-dark-400 text-xs font-body">winnings</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDrawsPage;
