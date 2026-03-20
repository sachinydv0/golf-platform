import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { charitiesAPI } from '../../services/api';

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');

  const categories = ['All', 'Health', 'Sport', 'Education', 'Environment', 'General'];

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)            params.search   = search;
      if (category && category !== 'All') params.category = category;
      const { data } = await charitiesAPI.getAll(params);
      setCharities(data.charities || []);
    } catch { setCharities([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, [search, category]);

  const featured = charities.filter(c => c.isFeatured);
  const rest      = charities.filter(c => !c.isFeatured);

  return (
    <div className="min-h-screen bg-dark-800 py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="section-tag mb-4">Charities</span>
          <h1 className="font-display font-extrabold text-5xl text-white mt-4 mb-4">
            Choose your cause
          </h1>
          <p className="text-dark-200 font-body max-w-xl mx-auto">
            A portion of every subscription goes directly to your chosen charity. Browse, filter, and find one that matters to you.
          </p>
        </motion.div>

        {/* Search + filter */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-10">
          <input type="text" placeholder="Search charities…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1" />
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-xl text-sm font-body transition-all border ${
                  (cat === 'All' && !category) || category === cat
                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                    : 'border-white/10 text-dark-300 hover:border-white/20'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && !search && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-lg text-white mb-4">Featured Charities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((c, i) => <CharityCard key={c._id} charity={c} i={i} featured />)}
                </div>
              </div>
            )}

            {/* All */}
            {rest.length > 0 && (
              <div>
                {featured.length > 0 && !search && (
                  <h2 className="font-display font-bold text-lg text-white mb-4">All Charities</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((c, i) => <CharityCard key={c._id} charity={c} i={i} />)}
                </div>
              </div>
            )}

            {charities.length === 0 && (
              <div className="text-center py-20 text-dark-300 font-body">
                No charities found. Try a different search.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CharityCard({ charity, i, featured }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
      <Link to={`/charities/${charity.slug}`} className="glass-hover rounded-2xl p-6 flex flex-col gap-4 h-full block">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display text-2xl flex-shrink-0">
            {charity.logo ? (
              <img src={charity.logo} alt={charity.name} className="w-full h-full object-contain rounded-xl" />
            ) : charity.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-white text-base leading-tight">{charity.name}</h3>
              {featured && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-sans flex-shrink-0">Featured</span>
              )}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 font-body mt-1 inline-block">{charity.category}</span>
          </div>
        </div>
        <p className="text-dark-200 text-sm leading-relaxed font-body line-clamp-2">{charity.shortDesc || charity.description}</p>
        {charity.events?.length > 0 && (
          <div className="text-brand-400 text-xs font-body">{charity.events.length} upcoming event{charity.events.length > 1 ? 's' : ''}</div>
        )}
      </Link>
    </motion.div>
  );
}
