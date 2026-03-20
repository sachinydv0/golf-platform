import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [acting, setActing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 20, search, status });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const toggleSubscription = async (userId, currentStatus) => {
    const action = currentStatus === 'active' ? 'cancel' : 'reactivate';
    if (!confirm(`${action} this user's subscription?`)) return;
    setActing(userId);
    try {
      await adminAPI.manageSubscription(userId, action);
      toast.success(`Subscription ${action}d`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActing(null); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Users</h1>
        <p className="text-dark-300 font-body text-sm">{total} registered users</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search name or email…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input flex-1" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input sm:w-40">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="past_due">Past due</option>
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="border-b border-white/5">
              <tr>
                {['User', 'Email', 'Plan', 'Status', 'Charity', 'Scores', 'Joined', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-400 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-dark-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-dark-300 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 font-sans capitalize">
                      {u.subscription?.plan || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                      u.subscription?.status === 'active'    ? 'bg-brand-500/15 text-brand-400' :
                      u.subscription?.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                      u.subscription?.status === 'past_due'  ? 'bg-amber-500/15 text-amber-400' :
                      'bg-dark-700 text-dark-400'
                    }`}>{u.subscription?.status || 'inactive'}</span>
                  </td>
                  <td className="px-4 py-3 text-dark-300 text-xs">
                    {u.charity?.charityId?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-dark-300 text-center">{u.scores?.length || 0}/5</td>
                  <td className="px-4 py-3 text-dark-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSubscription(u._id, u.subscription?.status)}
                      disabled={acting === u._id || !u.subscription?.stripeSubscriptionId}
                      className={`text-xs px-3 py-1 rounded-lg transition-colors disabled:opacity-40 ${
                        u.subscription?.status === 'active'
                          ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20'
                          : 'text-brand-400 hover:bg-brand-500/10 border border-brand-500/20'
                      }`}>
                      {acting === u._id ? '…' : u.subscription?.status === 'active' ? 'Cancel' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-dark-400 text-xs font-body">Showing {((page-1)*20)+1}–{Math.min(page*20, total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="btn-ghost py-1 px-3 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total}
                className="btn-ghost py-1 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
