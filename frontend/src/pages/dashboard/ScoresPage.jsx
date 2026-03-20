import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { scoresAPI } from '../../services/api';

export default function ScoresPage() {
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ value: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await scoresAPI.getScores(); setScores(data.scores || []); }
    catch { toast.error('Failed to load scores'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const val = parseInt(form.value);
    if (!val || val < 1 || val > 45) { toast.error('Score must be 1–45'); return; }
    setSaving(true);
    try {
      const { data } = await scoresAPI.addScore({ value: val, date: form.date });
      setScores(data.scores);
      toast.success('Score added');
      setShowAdd(false);
      setForm({ value: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add score'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const val = parseInt(form.value);
    if (!val || val < 1 || val > 45) { toast.error('Score must be 1–45'); return; }
    setSaving(true);
    try {
      const { data } = await scoresAPI.editScore(editing, { value: val, date: form.date });
      setScores(data.scores);
      toast.success('Score updated');
      setEditing(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update score'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this score?')) return;
    try {
      const { data } = await scoresAPI.deleteScore(id);
      setScores(data.scores);
      toast.success('Score deleted');
    } catch { toast.error('Failed to delete score'); }
  };

  const startEdit = (score) => {
    setEditing(score._id);
    setForm({ value: score.value, date: new Date(score.date).toISOString().split('T')[0] });
    setShowAdd(false);
  };

  const avgScore = scores.length ? (scores.reduce((s, x) => s + x.value, 0) / scores.length).toFixed(1) : '–';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">My Scores</h1>
        <p className="text-dark-300 font-body text-sm">Your latest 5 Stableford scores (1–45). Adding a 6th removes the oldest.</p>
      </motion.div>

      {/* Summary bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display font-bold text-2xl text-brand-400">{scores.length}</div>
          <div className="text-dark-400 text-xs font-body mt-0.5">of 5 scores</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display font-bold text-2xl text-white">{avgScore}</div>
          <div className="text-dark-400 text-xs font-body mt-0.5">Average</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display font-bold text-2xl text-purple-400">
            {scores.length > 0 ? Math.max(...scores.map(s => s.value)) : '–'}
          </div>
          <div className="text-dark-400 text-xs font-body mt-0.5">Best</div>
        </div>
      </motion.div>

      {/* Add button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {scores.length < 5 || showAdd ? null : null}
        <button onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
          className={`${showAdd ? 'btn-ghost' : 'btn-brand'} w-full py-3`}>
          {showAdd ? '✕ Cancel' : '+ Add new score'}
        </button>
      </motion.div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleAdd} className="glass rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-white">Add Score</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-200 text-xs font-body mb-1.5">Stableford points (1–45)</label>
                  <input type="number" min="1" max="45" required placeholder="e.g. 34"
                    className="input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
                <div>
                  <label className="block text-dark-200 text-xs font-body mb-1.5">Date played</label>
                  <input type="date" required className="input" value={form.date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-brand w-full py-2.5 disabled:opacity-60">
                {saving ? 'Saving…' : 'Add score'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scores list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : scores.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-30">⛳</div>
          <p className="text-dark-300 font-body">No scores yet. Add your first Stableford score above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.sort((a, b) => new Date(b.date) - new Date(a.date)).map((score, i) => (
            <AnimatePresence key={score._id}>
              {editing === score._id ? (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleEdit}
                  className="glass rounded-2xl p-5 border border-brand-500/30">
                  <h4 className="font-display font-semibold text-white text-sm mb-3">Edit score</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-dark-200 text-xs font-body mb-1">Points (1–45)</label>
                      <input type="number" min="1" max="45" required className="input py-2 text-sm"
                        value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-dark-200 text-xs font-body mb-1">Date</label>
                      <input type="date" required className="input py-2 text-sm" value={form.date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="btn-brand py-2 px-4 text-xs flex-1 disabled:opacity-60">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="btn-ghost py-2 px-4 text-xs">Cancel</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 flex items-center gap-4 group">
                  <div className="score-badge flex-shrink-0">{score.value}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-medium text-white">{score.value} Stableford points</div>
                    <div className="text-dark-400 text-xs font-body">{format(new Date(score.date), 'EEEE, dd MMMM yyyy')}</div>
                  </div>
                  {i === 0 && <span className="text-xs px-2 py-1 rounded-full bg-brand-500/15 text-brand-400 font-sans flex-shrink-0">Latest</span>}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(score)}
                      className="text-dark-300 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(score._id)}
                      className="text-dark-300 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      )}

      {/* Rolling info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4 border border-brand-500/10">
        <p className="text-dark-300 text-xs font-body leading-relaxed">
          <span className="text-brand-400 font-semibold">Rolling 5 scores:</span> Only your 5 most recent scores are kept.
          Adding a new score automatically removes the oldest. Scores are used in the monthly draw matching algorithm.
        </p>
      </motion.div>
    </div>
  );
}
