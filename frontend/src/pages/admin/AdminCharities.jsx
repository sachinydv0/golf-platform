import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { charitiesAPI } from '../../services/api';

const EMPTY = { name: '', description: '', shortDesc: '', category: 'Health', website: '', isFeatured: false };
const CATEGORIES = ['Health', 'Sport', 'Education', 'Environment', 'General', 'Poverty', 'Disability'];

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);  // charity._id or null
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await charitiesAPI.getAll();
      setCharities(data.charities || []);
    } catch { toast.error('Failed to load charities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      name:        c.name,
      description: c.description,
      shortDesc:   c.shortDesc || '',
      category:    c.category || 'Health',
      website:     c.website || '',
      isFeatured:  c.isFeatured || false,
    });
    setEditing(c._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) { toast.error('Name and description required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await charitiesAPI.update(editing, form);
        toast.success('Charity updated');
      } else {
        await charitiesAPI.create(form);
        toast.success('Charity created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? It won't appear publicly but data is preserved.`)) return;
    setDeleting(id);
    try {
      await charitiesAPI.remove(id);
      toast.success('Charity deactivated');
      load();
    } catch { toast.error('Failed to deactivate'); }
    finally { setDeleting(null); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white mb-1">Charities</h1>
          <p className="text-dark-300 font-body text-sm">{charities.length} active charities listed</p>
        </div>
        <button onClick={openCreate} className="btn-brand py-2.5 px-5 text-sm">+ Add charity</button>
      </motion.div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="glass rounded-2xl p-6 border border-brand-500/20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-white">
                {editing ? 'Edit charity' : 'Add new charity'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-white transition-colors text-lg">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-200 text-xs font-body mb-1.5">Charity name *</label>
                  <input required className="input" value={form.name} onChange={set('name')} placeholder="e.g. Cancer Research UK" />
                </div>
                <div>
                  <label className="block text-dark-200 text-xs font-body mb-1.5">Category</label>
                  <select className="input" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-dark-200 text-xs font-body mb-1.5">Short description (card preview, max 120 chars)</label>
                <input className="input" value={form.shortDesc} onChange={set('shortDesc')}
                  maxLength={120} placeholder="Brief one-liner shown on listing cards" />
              </div>

              <div>
                <label className="block text-dark-200 text-xs font-body mb-1.5">Full description *</label>
                <textarea required rows={4} className="input resize-none" value={form.description} onChange={set('description')}
                  placeholder="Full description of the charity's mission and work…" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-200 text-xs font-body mb-1.5">Website URL</label>
                  <input type="url" className="input" value={form.website} onChange={set('website')}
                    placeholder="https://charity.org" />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <label className="relative inline-flex items-center cursor-pointer gap-3">
                    <input type="checkbox" className="sr-only" checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    <div className={`w-10 h-5 rounded-full transition-colors border ${form.isFeatured ? 'bg-brand-500 border-brand-500' : 'bg-dark-600 border-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ position: 'relative', top: '50%', transform: `translateY(-50%) translateX(${form.isFeatured ? '20px' : '2px'})` }} />
                    </div>
                    <span className="text-dark-200 text-sm font-body">Featured on homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-brand py-2.5 px-6 disabled:opacity-60">
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create charity'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost py-2.5 px-5">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : charities.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-30">♥</div>
          <p className="text-dark-300 font-body">No charities yet. Add the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {charities.map((c, i) => (
            <motion.div key={c._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5 flex items-center gap-4 group">

              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display text-lg flex-shrink-0">
                {c.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-semibold text-white text-sm">{c.name}</span>
                  {c.isFeatured && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-sans">Featured</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 font-body">{c.category}</span>
                  <span className="text-dark-400 text-xs font-body truncate">{c.shortDesc}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-center">
                <div>
                  <div className="text-white font-display font-bold text-sm">£{(c.totalReceived || 0).toFixed(0)}</div>
                  <div className="text-dark-500 text-xs font-body">received</div>
                </div>
                <div>
                  <div className="text-white font-display font-bold text-sm">{c.subscriberCount || 0}</div>
                  <div className="text-dark-500 text-xs font-body">supporters</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-dark-200 hover:text-white hover:border-white/25 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(c._id, c.name)} disabled={deleting === c._id}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                  {deleting === c._id ? '…' : 'Deactivate'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
