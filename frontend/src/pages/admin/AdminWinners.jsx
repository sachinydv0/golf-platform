// AdminWinners.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { winnersAPI } from '../../services/api';

export function AdminWinners() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await winnersAPI.getPending(); setPending(data.pending || []); }
    catch { toast.error('Failed to load winners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const verify = async (drawId, winnerId, action) => {
    setActing(winnerId);
    try {
      await winnersAPI.verify(drawId, winnerId, { action });
      toast.success(`Winner ${action}d`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActing(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Winner Verification</h1>
        <p className="text-dark-300 font-body text-sm">Review and approve prize claim submissions.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-32 animate-pulse" />)}</div>
      ) : pending.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-30">🏆</div>
          <p className="text-dark-300 font-body">No pending verifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(({ drawId, drawMonth, drawYear, winner }, i) => (
            <motion.div key={winner._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                      winner.matchType === '5-match' ? 'bg-brand-500/20 text-brand-400' :
                      winner.matchType === '4-match' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{winner.matchType}</span>
                    <span className="text-dark-400 text-xs font-body">Draw {drawMonth}/{drawYear}</span>
                  </div>
                  <div className="font-display font-semibold text-white">
                    {winner.userId?.firstName} {winner.userId?.lastName}
                  </div>
                  <div className="text-dark-400 text-xs font-body">{winner.userId?.email}</div>
                  <div className="text-brand-400 font-display font-bold mt-1">£{winner.prizeAmount?.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => verify(drawId, winner._id, 'approve')} disabled={acting === winner._id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/20 hover:bg-brand-500/25 transition-colors disabled:opacity-50">
                    ✓ Approve
                  </button>
                  <button onClick={() => verify(drawId, winner._id, 'reject')} disabled={acting === winner._id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors disabled:opacity-50">
                    ✕ Reject
                  </button>
                </div>
              </div>
              {winner.proofUrl && (
                <div>
                  <div className="text-dark-400 text-xs font-body mb-2">Submitted proof:</div>
                  <a href={winner.proofUrl} target="_blank" rel="noopener noreferrer"
                    className="text-brand-400 text-xs hover:underline font-body">View screenshot →</a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminWinners;
