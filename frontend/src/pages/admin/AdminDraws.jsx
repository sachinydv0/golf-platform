import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { drawsAPI } from '../../services/api';

export default function AdminDraws() {
  const [draws,      setDraws]      = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [running,    setRunning]    = useState(false);
  const [publishing, setPublishing] = useState(false);

  const now   = new Date();
  const [config, setConfig] = useState({
    month:    now.getMonth() + 1,
    year:     now.getFullYear(),
    drawType: 'random',
    algoMode: 'most',
  });

  const load = async () => {
    setLoading(true);
    try { const { data } = await drawsAPI.adminGetAll(); setDraws(data.draws || []); }
    catch { toast.error('Failed to load draws'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSimulate = async () => {
    setRunning(true);
    try {
      const { data } = await drawsAPI.simulate(config);
      setSimulation(data.simulation);
      toast.success('Simulation complete');
    } catch (err) { toast.error(err.response?.data?.message || 'Simulation failed'); }
    finally { setRunning(false); }
  };

  const handlePublish = async () => {
    if (!confirm(`Publish draw for ${config.month}/${config.year}? This cannot be undone.`)) return;
    setPublishing(true);
    try {
      const payload = { ...config };
      if (simulation) payload.drawNumbers = simulation.drawNumbers;
      await drawsAPI.publish(payload);
      toast.success('Draw published and emails sent');
      setSimulation(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
    finally { setPublishing(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Draw Management</h1>
        <p className="text-dark-300 font-body text-sm">Configure, simulate, and publish monthly prize draws.</p>
      </motion.div>

      {/* Config */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="glass rounded-2xl p-6 space-y-6">
        <h2 className="font-display font-semibold text-white">Draw Configuration</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-dark-300 text-xs font-body mb-1.5">Month</label>
            <select className="input text-sm" value={config.month}
              onChange={(e) => setConfig({ ...config, month: parseInt(e.target.value) })}>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-dark-300 text-xs font-body mb-1.5">Year</label>
            <select className="input text-sm" value={config.year}
              onChange={(e) => setConfig({ ...config, year: parseInt(e.target.value) })}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-dark-300 text-xs font-body mb-1.5">Draw type</label>
            <select className="input text-sm" value={config.drawType}
              onChange={(e) => setConfig({ ...config, drawType: e.target.value })}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          {config.drawType === 'algorithmic' && (
            <div>
              <label className="block text-dark-300 text-xs font-body mb-1.5">Algorithm mode</label>
              <select className="input text-sm" value={config.algoMode}
                onChange={(e) => setConfig({ ...config, algoMode: e.target.value })}>
                <option value="most">Most common scores</option>
                <option value="least">Least common scores</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleSimulate} disabled={running}
            className="btn-ghost py-2.5 px-6 disabled:opacity-60">
            {running ? 'Simulating…' : '⚡ Run simulation'}
          </button>
          <button onClick={handlePublish} disabled={publishing}
            className="btn-brand py-2.5 px-6 disabled:opacity-60">
            {publishing ? 'Publishing…' : '🚀 Publish draw'}
          </button>
        </div>
      </motion.div>

      {/* Simulation result */}
      {simulation && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-amber-500/20"
          style={{ background: 'rgba(245,158,11,0.04)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="section-tag text-amber-400 border-amber-500/20">Simulation preview</span>
            <span className="text-dark-400 text-xs font-body">Not yet published</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoTile label="Participants"   value={simulation.totalParticipants} />
            <InfoTile label="Prize pool"     value={`£${(simulation.pool?.total || 0).toFixed(2)}`} />
            <InfoTile label="Jackpot"        value={`£${(simulation.pool?.jackpot || 0).toFixed(2)}`} color="text-amber-400" />
            <InfoTile label="Jackpot won?"   value={simulation.jackpotWon ? 'Yes' : 'No — rollover'}
              color={simulation.jackpotWon ? 'text-brand-400' : 'text-red-400'} />
          </div>

          <div className="mb-6">
            <div className="text-dark-300 text-xs font-body mb-2">Drawn numbers</div>
            <div className="flex gap-3 flex-wrap">
              {simulation.drawNumbers.map(n => (
                <div key={n} className="score-badge w-12 h-12 text-lg">{n}</div>
              ))}
            </div>
          </div>

          {simulation.winners?.length > 0 ? (
            <div>
              <div className="text-dark-300 text-xs font-body mb-2">Winners ({simulation.winners.length})</div>
              <div className="space-y-2">
                {simulation.winners.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-body">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-sans ${
                      w.matchType === '5-match' ? 'bg-brand-500/20 text-brand-400' :
                      w.matchType === '4-match' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{w.matchType}</span>
                    <span className="text-white">Prize: £{w.prizeAmount.toFixed(2)}</span>
                    <span className="text-dark-400 text-xs">Matched: [{w.matchedNumbers.join(', ')}]</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-dark-400 text-sm font-body">No winners in this simulation.</p>
          )}

          <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
            <button onClick={handlePublish} disabled={publishing} className="btn-brand py-2 px-6 disabled:opacity-60 text-sm">
              {publishing ? 'Publishing…' : '✓ Publish this draw'}
            </button>
            <button onClick={() => setSimulation(null)} className="btn-ghost py-2 px-4 text-sm">Discard</button>
          </div>
        </motion.div>
      )}

      {/* Published draws list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-sm">Published Draws</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse" />)}</div>
        ) : draws.length === 0 ? (
          <p className="text-dark-400 font-body text-sm text-center py-8">No draws published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-white/5">
                  {['Period', 'Numbers', 'Participants', 'Pool', 'Winners', 'Status'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 text-dark-400 text-xs font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {draws.map(d => (
                  <tr key={d._id}>
                    <td className="py-3 pr-4 text-white font-medium">{d.month}/{d.year}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1">
                        {d.drawNumbers?.map(n => (
                          <span key={n} className="text-brand-400 font-mono text-xs bg-brand-500/10 px-1.5 py-0.5 rounded">{n}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-dark-300">{d.totalParticipants}</td>
                    <td className="py-3 pr-4 text-dark-300">£{(d.pool?.total || 0).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-dark-300">{d.winners?.length || 0}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                        d.status === 'published' ? 'bg-brand-500/15 text-brand-400' : 'bg-dark-700 text-dark-300'
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function InfoTile({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-dark-700/50 rounded-xl p-4">
      <div className="text-dark-400 text-xs font-body mb-1">{label}</div>
      <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}
