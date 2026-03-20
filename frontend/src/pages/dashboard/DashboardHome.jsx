import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import useAuthStore from '../../context/authStore';
import { drawsAPI } from '../../services/api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export default function DashboardHome() {
  const { user, refreshUser } = useAuthStore();
  const [currentDraw, setCurrentDraw] = useState(null);

  useEffect(() => {
    refreshUser();
    drawsAPI.getCurrentDraw().then(({ data }) => setCurrentDraw(data.draw)).catch(() => {});
  }, []);

  const sub = user?.subscription;
  const subActive = sub?.status === 'active';
  const scores = user?.scores?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Greeting */}
      <motion.div {...fadeUp()}>
        <h1 className="font-display font-extrabold text-3xl text-white">
          Good {greeting()}, {user?.firstName} 👋
        </h1>
        <p className="text-dark-300 font-body mt-1">Here's your platform overview.</p>
      </motion.div>

      {/* Subscription alert */}
      {!subActive && (
        <motion.div {...fadeUp(0.05)}
          className="rounded-xl p-4 border border-amber-500/30 flex items-center justify-between gap-4"
          style={{ background: 'rgba(245,158,11,0.08)' }}>
          <div>
            <p className="font-display font-semibold text-amber-400 text-sm">No active subscription</p>
            <p className="text-dark-300 text-xs font-body mt-0.5">Subscribe to enter draws, track scores, and support charities.</p>
          </div>
          <Link to="/pricing" className="btn-brand py-2 px-4 text-xs flex-shrink-0">Subscribe →</Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Subscription" value={subActive ? sub.plan : 'Inactive'}
          sub={subActive ? `Renews ${sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy') : '—'}` : 'Not subscribed'}
          color={subActive ? 'brand' : 'gray'} />
        <StatCard label="Scores entered" value={scores.length} sub="of 5 max" color="blue" />
        <StatCard label="Draws entered" value={user?.drawsEntered || 0} sub="lifetime" color="purple" />
        <StatCard label="Total winnings" value={`£${(user?.totalWinnings || 0).toFixed(2)}`} sub="all time" color="green" />
      </motion.div>

      {/* Scores + current draw */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent scores */}
        <motion.div {...fadeUp(0.12)} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">Recent Scores</h2>
            <Link to="/dashboard/scores" className="text-brand-400 text-xs font-body hover:text-brand-300">
              {subActive ? 'Manage →' : 'View →'}
            </Link>
          </div>
          {scores.length === 0 ? (
            <div className="text-center py-8 text-dark-400 font-body text-sm">
              {subActive ? 'No scores yet. Add your first score.' : 'Subscribe to enter scores.'}
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((s, i) => (
                <div key={s._id} className="flex items-center gap-4">
                  <div className="score-badge w-10 h-10 text-sm flex-shrink-0">{s.value}</div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-body">{s.value} pts Stableford</div>
                    <div className="text-dark-400 text-xs font-body">{format(new Date(s.date), 'dd MMM yyyy')}</div>
                  </div>
                  {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-sans">Latest</span>}
                </div>
              ))}
            </div>
          )}
          {subActive && (
            <Link to="/dashboard/scores" className="btn-ghost w-full mt-4 py-2 text-xs">Add / manage scores</Link>
          )}
        </motion.div>

        {/* Current draw */}
        <motion.div {...fadeUp(0.16)} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">This Month's Draw</h2>
            <Link to="/dashboard/draws" className="text-brand-400 text-xs font-body hover:text-brand-300">View all →</Link>
          </div>
          {currentDraw ? (
            <DrawSummary draw={currentDraw} />
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-40">🎯</div>
              <p className="text-dark-300 text-sm font-body">No draw published yet this month.</p>
              <p className="text-dark-400 text-xs font-body mt-1">Keep your scores updated to participate.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charity */}
      <motion.div {...fadeUp(0.2)} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white">My Charity</h2>
          <Link to="/dashboard/charity" className="text-brand-400 text-xs font-body hover:text-brand-300">Change →</Link>
        </div>
        {user?.charity?.charityId ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display text-xl flex-shrink-0">
              {user.charity.charityId?.name?.[0] || '?'}
            </div>
            <div>
              <div className="font-display font-semibold text-white">{user.charity.charityId?.name || 'Unknown'}</div>
              <div className="text-brand-400 text-sm font-body">{user.charity.contributionPercent}% of subscription</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-dark-300 text-sm font-body">No charity selected yet.</p>
            <Link to="/dashboard/charity" className="btn-brand py-2 px-4 text-xs">Choose one →</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const colorMap = {
    brand:  'text-brand-400 border-brand-500/20 bg-brand-500/8',
    blue:   'text-blue-400 border-blue-500/20 bg-blue-500/8',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/8',
    green:  'text-green-400 border-green-500/20 bg-green-500/8',
    gray:   'text-dark-300 border-white/8 bg-white/4',
  };
  return (
    <div className={`glass rounded-2xl p-5 border ${colorMap[color]}`}>
      <div className="text-dark-300 text-xs font-body mb-1">{label}</div>
      <div className={`font-display font-extrabold text-2xl capitalize ${colorMap[color].split(' ')[0]}`}>{value}</div>
      <div className="text-dark-400 text-xs font-body mt-0.5">{sub}</div>
    </div>
  );
}

function DrawSummary({ draw }) {
  const statusColor = { published: 'text-brand-400', pending: 'text-amber-400', simulated: 'text-blue-400' };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-body ${statusColor[draw.status]}`}>{draw.status}</span>
        <span className="text-dark-400 text-xs font-body">{draw.month}/{draw.year}</span>
      </div>
      {draw.status === 'published' && draw.drawNumbers?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {draw.drawNumbers.map((n) => (
            <div key={n} className="score-badge w-10 h-10 text-sm">{n}</div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-dark-400 text-xs font-body">Prize pool</div>
          <div className="text-white font-body font-medium">£{(draw.pool?.total || 0).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-dark-400 text-xs font-body">Participants</div>
          <div className="text-white font-body font-medium">{draw.totalParticipants}</div>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
