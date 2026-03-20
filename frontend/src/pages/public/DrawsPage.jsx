import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { drawsAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DrawsPage() {
  const [draws,   setDraws]   = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    Promise.all([
      drawsAPI.getDraws({ page, limit: 9 }),
      drawsAPI.getCurrentDraw(),
    ]).then(([listRes, curRes]) => {
      setDraws(listRes.data.draws || []);
      setTotal(listRes.data.total || 0);
      setCurrent(curRes.data.draw || null);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-dark-800 py-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="section-tag mb-4">Monthly Draws</span>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-white mt-4 mb-4">
            Draw results
          </h1>
          <p className="text-dark-200 font-body max-w-xl mx-auto">
            5 numbers drawn every month. Match 3, 4, or all 5 to win your share of the prize pool.
          </p>
        </motion.div>

        {/* How matching works */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="glass rounded-2xl p-6 mb-10">
          <h2 className="font-display font-semibold text-white mb-4 text-sm text-center">How the draw works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { match: '3 Numbers', share: '25%', prize: 'of pool', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { match: '4 Numbers', share: '35%', prize: 'of pool', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { match: '5 Numbers', share: '40%', prize: 'jackpot', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/25', jackpot: true },
            ].map(({ match, share, prize, color, bg, jackpot }) => (
              <div key={match} className={`rounded-xl p-4 border text-center ${bg}`}>
                <div className={`font-display font-extrabold text-3xl ${color} mb-1`}>{share}</div>
                <div className="text-white text-sm font-display font-semibold">{match}</div>
                <div className="text-dark-400 text-xs font-body mt-0.5">{prize}</div>
                {jackpot && <div className="text-brand-400 text-xs font-body mt-1">Rolls over if unclaimed</div>}
              </div>
            ))}
          </div>
          <p className="text-dark-400 text-xs text-center mt-4 font-body">
            Your 5 Stableford scores are your "numbers". If any appear in the draw, you've matched them.
            Multiple winners split the tier prize equally.
          </p>
        </motion.div>

        {/* Current month draw */}
        {current && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-10 glass rounded-2xl p-6 border border-brand-500/20"
            style={{ background: 'linear-gradient(135deg,rgba(0,204,127,0.06),rgba(0,204,127,0.02))' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="section-tag">
                {current.status === 'published' ? 'Latest draw' : 'This month'}
              </span>
              <span className="text-dark-400 text-xs font-body">
                {MONTHS[current.month - 1]} {current.year}
              </span>
            </div>

            {current.status === 'published' ? (
              <div className="space-y-4">
                <div>
                  <div className="text-dark-300 text-xs font-body mb-2">Drawn numbers</div>
                  <div className="flex gap-3 flex-wrap">
                    {current.drawNumbers?.map(n => (
                      <div key={n} className="score-badge w-14 h-14 text-xl">{n}</div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Tile label="Prize pool"   value={`£${(current.pool?.total || 0).toFixed(2)}`} />
                  <Tile label="Jackpot"      value={`£${(current.pool?.jackpot || 0).toFixed(2)}`} />
                  <Tile label="Participants" value={current.totalParticipants} />
                  <Tile label="Winners"      value={current.winners?.length || 0} />
                </div>
                {current.publishedAt && (
                  <p className="text-dark-400 text-xs font-body">
                    Published {format(new Date(current.publishedAt), 'dd MMMM yyyy')}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-dark-300 font-body text-sm">Draw not yet published for this month.</p>
                <p className="text-dark-400 text-xs font-body mt-1">Keep your scores updated to participate.</p>
                <Link to="/register" className="btn-brand mt-4 py-2 px-6 text-sm inline-block">
                  Subscribe to participate →
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Past draws */}
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-6">Past draws</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl h-48 animate-pulse" />)}
            </div>
          ) : draws.length === 0 ? (
            <div className="text-center py-16 text-dark-400 font-body">No draws published yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draws.map((draw, i) => (
                <motion.div key={draw._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-hover rounded-2xl p-5 space-y-4">
                  {/* Month/Year */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-white">
                        {MONTHS[draw.month - 1]} {draw.year}
                      </div>
                      <div className="text-dark-400 text-xs font-body">
                        {draw.drawType} draw
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-sans capitalize">
                      {draw.status}
                    </span>
                  </div>

                  {/* Numbers */}
                  <div>
                    <div className="text-dark-400 text-xs font-body mb-2">Drawn numbers</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {draw.drawNumbers?.map(n => (
                        <span key={n}
                          className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold font-sans flex items-center justify-center">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <div className="text-center">
                      <div className="text-white font-display font-bold text-sm">£{(draw.pool?.total || 0).toFixed(0)}</div>
                      <div className="text-dark-500 text-xs font-body">Pool</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-display font-bold text-sm">{draw.totalParticipants}</div>
                      <div className="text-dark-500 text-xs font-body">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-display font-bold text-sm">{draw.winners?.length || 0}</div>
                      <div className="text-dark-500 text-xs font-body">Winners</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 9 && (
            <div className="flex justify-center gap-3 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost py-2 px-6 disabled:opacity-40">← Previous</button>
              <span className="flex items-center text-dark-400 text-sm font-body px-4">
                Page {page} of {Math.ceil(total / 9)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 9 >= total}
                className="btn-ghost py-2 px-6 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 glass rounded-2xl p-10 text-center border border-brand-500/15"
          style={{ background: 'linear-gradient(135deg,rgba(0,204,127,0.06),rgba(0,204,127,0.02))' }}>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Ready to participate?</h2>
          <p className="text-dark-300 font-body text-sm mb-6 max-w-md mx-auto">
            Subscribe, enter your Stableford scores, and you're automatically entered in next month's draw.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="btn-brand py-3 px-8">Get started →</Link>
            <Link to="/pricing"  className="btn-ghost py-3 px-8">View pricing</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="bg-white/4 rounded-xl p-3 text-center">
      <div className="font-display font-bold text-white text-lg">{value}</div>
      <div className="text-dark-400 text-xs font-body mt-0.5">{label}</div>
    </div>
  );
}
