import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../../services/api';

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d } });

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data: d }) => setData(d.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => <div key={i} className="glass rounded-2xl h-28" />)}
    </div>
  );

  const stats = [
    { label: 'Total Users',      value: data?.totalUsers || 0,       color: 'text-white', sub: 'registered' },
    { label: 'Active Subscribers', value: data?.activeUsers || 0,     color: 'text-brand-400', sub: 'subscribed now' },
    { label: 'Total Revenue',    value: `£${(data?.totalRevenue || 0).toFixed(2)}`, color: 'text-green-400', sub: 'all time' },
    { label: 'Charity Total',    value: `£${(data?.totalCharityPool || 0).toFixed(2)}`, color: 'text-purple-400', sub: 'distributed' },
    { label: 'Prize Pool Total', value: `£${(data?.totalPrizePool || 0).toFixed(2)}`, color: 'text-amber-400', sub: 'drawn to date' },
    { label: 'Charities',        value: data?.totalCharities || 0,    color: 'text-blue-400', sub: 'active listings' },
  ];

  const chartData = Object.entries(data?.monthlyRevenue || {}).map(([k, v]) => ({
    month: k.slice(5), revenue: v,
  })).slice(-6);

  const drawChartData = (data?.drawStats || []).map(d => ({
    name: d.label, pool: d.prizePool, participants: d.participants,
  })).slice(-6).reverse();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div {...fadeUp()}>
        <h1 className="font-display font-extrabold text-3xl text-white">Admin Dashboard</h1>
        <p className="text-dark-300 font-body mt-1 text-sm">Platform overview and analytics</p>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, color, sub }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="text-dark-400 text-xs font-body mb-1">{label}</div>
            <div className={`font-display font-extrabold text-2xl ${color}`}>{value}</div>
            <div className="text-dark-500 text-xs font-body mt-0.5">{sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeUp(0.1)} className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-white mb-4 text-sm">Monthly Revenue (£)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="month" tick={{ fill: '#707070', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#707070', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #303030', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f0f0f0' }} itemStyle={{ color: '#00cc7f' }} />
                <Bar dataKey="revenue" fill="#00cc7f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-dark-400 text-sm font-body">No revenue data yet</div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.12)} className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-white mb-4 text-sm">Prize Pool by Draw (£)</h2>
          {drawChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={drawChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#707070', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#707070', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #303030', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f0f0f0' }} itemStyle={{ color: '#a855f7' }} />
                <Bar dataKey="pool" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-dark-400 text-sm font-body">No draw data yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent users */}
      <motion.div {...fadeUp(0.15)} className="glass rounded-2xl p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-sm">Recent Signups</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Email', 'Plan', 'Status', 'Joined'].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-dark-400 text-xs font-body font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data?.recentUsers || []).map(u => (
                <tr key={u._id}>
                  <td className="py-3 pr-4 text-white font-body">{u.firstName} {u.lastName}</td>
                  <td className="py-3 pr-4 text-dark-300 font-body text-xs">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 font-sans capitalize">
                      {u.subscription?.plan || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                      u.subscription?.status === 'active' ? 'bg-brand-500/15 text-brand-400' : 'bg-dark-700 text-dark-400'
                    }`}>{u.subscription?.status || 'inactive'}</span>
                  </td>
                  <td className="py-3 text-dark-400 text-xs font-body">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
