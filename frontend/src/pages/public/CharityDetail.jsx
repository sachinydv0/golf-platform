import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { charitiesAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

export default function CharityDetail() {
  const { slug } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    charitiesAPI.getOne(slug)
      .then(({ data }) => setCharity(data.charity))
      .catch(() => setCharity(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-dark-800 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 space-y-6 animate-pulse">
        <div className="h-10 w-1/2 rounded-xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
      </div>
    </div>
  );

  if (!charity) return (
    <div className="min-h-screen bg-dark-800 pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 opacity-30">♥</div>
        <h1 className="font-display font-bold text-2xl text-white mb-2">Charity not found</h1>
        <Link to="/charities" className="text-brand-400 hover:text-brand-300 font-body text-sm">← Back to charities</Link>
      </div>
    </div>
  );

  const isSelected = user?.charity?.charityId === charity._id ||
    (typeof user?.charity?.charityId === 'object' && user?.charity?.charityId?._id === charity._id);

  return (
    <div className="min-h-screen bg-dark-800 py-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Link to="/charities" className="text-dark-400 hover:text-brand-400 text-sm font-body transition-colors">
            ← All charities
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display text-4xl flex-shrink-0">
            {charity.logo
              ? <img src={charity.logo} alt={charity.name} className="w-full h-full object-contain rounded-2xl" />
              : charity.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">{charity.name}</h1>
              {charity.isFeatured && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-sans">Featured</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-dark-700 text-dark-300 font-body">{charity.category}</span>
              {charity.website && (
                <a href={charity.website} target="_blank" rel="noopener noreferrer"
                  className="text-brand-400 text-xs hover:text-brand-300 transition-colors font-body">
                  Visit website →
                </a>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="glass rounded-2xl p-6">
              <h2 className="font-display font-semibold text-white mb-3">About</h2>
              <p className="text-dark-200 leading-relaxed font-body">{charity.description}</p>
            </motion.div>

            {/* Images */}
            {charity.images?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                className="glass rounded-2xl p-6">
                <h2 className="font-display font-semibold text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 gap-3">
                  {charity.images.map((img, i) => (
                    <img key={i} src={img} alt={`${charity.name} ${i + 1}`}
                      className="rounded-xl w-full h-40 object-cover" />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Events */}
            {charity.events?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="glass rounded-2xl p-6">
                <h2 className="font-display font-semibold text-white mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {charity.events
                    .filter(e => new Date(e.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event) => (
                      <div key={event._id} className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                        <div className="text-center flex-shrink-0 w-12">
                          <div className="font-display font-bold text-brand-400 text-lg leading-none">
                            {format(new Date(event.date), 'dd')}
                          </div>
                          <div className="text-dark-400 text-xs font-body uppercase">
                            {format(new Date(event.date), 'MMM')}
                          </div>
                        </div>
                        <div>
                          <div className="font-display font-semibold text-white text-sm">{event.title}</div>
                          {event.location && (
                            <div className="text-dark-400 text-xs font-body mt-0.5">📍 {event.location}</div>
                          )}
                          {event.desc && (
                            <div className="text-dark-300 text-xs font-body mt-1 leading-relaxed">{event.desc}</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Stats */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-white text-sm">Impact</h3>
              <div>
                <div className="text-dark-400 text-xs font-body">Total received</div>
                <div className="font-display font-bold text-2xl text-brand-400">
                  £{(charity.totalReceived || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-dark-400 text-xs font-body">Subscribers supporting</div>
                <div className="font-display font-bold text-xl text-white">
                  {charity.subscriberCount || 0}
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}
              className="glass rounded-2xl p-5 border border-brand-500/20"
              style={{ background: 'linear-gradient(135deg,rgba(0,204,127,0.07),rgba(0,204,127,0.02))' }}>
              <h3 className="font-display font-semibold text-white text-sm mb-2">Support this charity</h3>
              <p className="text-dark-300 text-xs font-body leading-relaxed mb-4">
                Subscribe to the platform and choose {charity.name} as your charity. Min 10% of your subscription goes directly to them.
              </p>
              {user ? (
                isSelected ? (
                  <div className="text-center">
                    <div className="text-brand-400 text-sm font-body mb-3">✓ You're supporting this charity</div>
                    <Link to="/dashboard/charity" className="btn-ghost w-full py-2 text-xs text-center block">
                      Change contribution %
                    </Link>
                  </div>
                ) : (
                  <Link to="/dashboard/charity" className="btn-brand w-full py-2.5 text-center block text-sm">
                    Choose this charity →
                  </Link>
                )
              ) : (
                <div className="space-y-2">
                  <Link to="/register" className="btn-brand w-full py-2.5 text-center block text-sm">
                    Get started →
                  </Link>
                  <Link to="/login" className="btn-ghost w-full py-2 text-center block text-xs">
                    Already a member? Login
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Back link */}
            <Link to="/charities"
              className="block text-center text-dark-400 text-xs hover:text-brand-400 transition-colors font-body">
              ← View all charities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
