import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { charitiesAPI } from '../../services/api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const STEPS = [
  { n: '01', title: 'Subscribe', desc: 'Choose monthly or yearly. A portion of your fee goes straight to prize pools and charity.' },
  { n: '02', title: 'Enter Scores', desc: 'Log your latest 5 Stableford scores (1–45). We keep the rolling five most recent.' },
  { n: '03', title: 'Monthly Draw', desc: 'Every month, 5 numbers are drawn. Match 3, 4, or all 5 to win your share of the pool.' },
  { n: '04', title: 'Give Back', desc: 'At least 10% of your subscription goes directly to a charity you choose. More if you want.' },
];

const PRIZES = [
  { match: '3 Numbers', share: '25%', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400' },
  { match: '4 Numbers', share: '35%', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', text: 'text-purple-400' },
  { match: '5 Numbers', share: '40%', color: 'from-brand-500/25 to-brand-600/5', border: 'border-brand-500/30', text: 'text-brand-400', jackpot: true },
];

const STATS = [
  { value: '£40K+', label: 'Monthly Prize Pool' },
  { value: '12+',   label: 'Supported Charities' },
  { value: '5',     label: 'Scores Tracked' },
  { value: '100%',  label: 'Transparent' },
];

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState([]);

  useEffect(() => {
    charitiesAPI.getAll({ featured: true }).then(({ data }) => setFeaturedCharities(data.charities?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-dark-800">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background grid + glow */}
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,204,127,0.12) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-4xl">
            <motion.div {...fadeUp(0)} className="mb-6">
              <span className="section-tag">Golf · Charity · Monthly Draws</span>
            </motion.div>

            <motion.h1 {...fadeUp(0.08)}
              className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6">
              Play golf.<br />
              <span className="text-gradient">Give back.</span><br />
              Win big.
            </motion.h1>

            <motion.p {...fadeUp(0.16)}
              className="text-dark-200 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl font-body">
              Subscribe, enter your Stableford scores, support a charity you love,
              and compete in monthly prize draws. Golf with purpose.
            </motion.p>

            <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-brand text-base px-8 py-4">
                Start for free →
              </Link>
              <Link to="/draws" className="btn-ghost text-base px-8 py-4">
                See how draws work
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div {...fadeUp(0.32)} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="font-display font-extrabold text-3xl text-gradient">{value}</div>
                  <div className="text-dark-300 text-xs mt-1 font-body">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating score balls decoration */}
        <div className="absolute right-8 top-1/4 hidden xl:flex flex-col gap-4 opacity-60">
          {[34, 28, 41, 19, 36].map((n, i) => (
            <motion.div key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              className="score-badge w-14 h-14 text-xl">
              {n}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <span className="section-tag mb-4">How it works</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-4">
            Simple as a birdie
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, desc }, i) => (
            <motion.div key={n} {...fadeUp(i * 0.08)}
              className="glass-hover rounded-2xl p-6 relative group">
              <div className="font-display font-extrabold text-5xl text-white/5 absolute top-4 right-4 group-hover:text-brand-500/10 transition-colors">
                {n}
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-sans text-sm mb-4">
                {n}
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
              <p className="text-dark-200 text-sm leading-relaxed font-body">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Prize Pool ────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="section-tag mb-4">Prize structure</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-4">
              Three ways to win
            </h2>
            <p className="text-dark-300 mt-4 max-w-xl mx-auto font-body">
              Match 3, 4, or 5 numbers each month. The jackpot rolls over if no one matches all 5.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {PRIZES.map(({ match, share, color, border, text, jackpot }, i) => (
              <motion.div key={match} {...fadeUp(i * 0.1)}
                className={`prize-card border ${border} bg-gradient-to-b ${color} ${jackpot ? 'ring-1 ring-brand-500/30' : ''}`}>
                {jackpot && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold font-sans mb-3 whitespace-nowrap"
                    style={{ background: 'rgba(0,204,127,0.15)', color: '#00cc7f' }}>
                    Jackpot rollover
                  </div>
                )}
                <div className={`font-display font-extrabold text-4xl sm:text-5xl ${text} mb-2`}>{share}</div>
                <div className="text-white font-display font-semibold text-base sm:text-lg">{match}</div>
                <div className="text-dark-300 text-xs mt-1 font-body">of monthly pool</div>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeUp(0.3)} className="text-center text-dark-400 text-sm mt-8 font-body">
            Prizes split equally among all winners in each tier · Jackpot carries to next month if unclaimed
          </motion.p>
        </div>
      </section>

      {/* ── Charity Section ───────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp()}>
            <span className="section-tag mb-6">Giving back</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-4 mb-6">
              Every swing<br />helps someone
            </h2>
            <p className="text-dark-200 leading-relaxed mb-6 font-body">
              At least 10% of every subscription goes directly to a charity of your choice.
              You can increase that percentage anytime — or make independent donations.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Choose from our curated charity directory',
                'Minimum 10% of subscription — increase anytime',
                'See your total contribution in your dashboard',
                'Charities post events like golf days you can join',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-dark-200 text-sm font-body">
                  <span className="text-brand-400 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/charities" className="btn-brand">Browse charities →</Link>
          </motion.div>

          {/* Featured charities */}
          <motion.div {...fadeUp(0.1)} className="space-y-4">
            {(featuredCharities.length ? featuredCharities : [
              { _id: '1', name: 'Cancer Research UK',       shortDesc: 'World-leading cancer research charity.',    category: 'Health' },
              { _id: '2', name: 'Golf Foundation',          shortDesc: 'Golf access for young people.',             category: 'Sport'  },
              { _id: '3', name: 'British Heart Foundation', shortDesc: 'Heart disease research and support.',       category: 'Health' },
            ]).map((c, i) => (
              <motion.div key={c._id} {...fadeUp(i * 0.08)}
                className="glass-hover rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-sans text-lg flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-white text-sm">{c.name}</div>
                  <div className="text-dark-300 text-xs mt-0.5 truncate font-body">{c.shortDesc}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-dark-700 text-dark-300 font-body flex-shrink-0">{c.category}</span>
              </motion.div>
            ))}
            <Link to="/charities" className="block text-center text-brand-400 text-sm hover:text-brand-300 transition-colors mt-4 font-body">
              View all charities →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div {...fadeUp()}
          className="glass rounded-3xl p-6 sm:p-12 md:p-20 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,204,127,0.08), rgba(0,204,127,0.03))' }}>
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <span className="section-tag mb-6">Ready to play?</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl text-white mt-4 mb-6">
              Join the community.<br />
              <span className="text-gradient">Make your game count.</span>
            </h2>
            <p className="text-dark-200 text-lg mb-10 max-w-xl mx-auto font-body">
              Monthly plans from just £19.99. Cancel anytime. Every subscription funds a charity and enters a prize draw.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="btn-brand text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4">Get started today</Link>
              <Link to="/pricing"  className="btn-ghost text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4">View pricing</Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}