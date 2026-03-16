import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search as SearchIcon, X, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../data/products';
import { useApp, useProducts } from '../context/AppContext';

const GOLD = '#C9A227';
const CARD_BG = '#FFFFFF';
const BORDER = '#EDE5D0';
const TEXT = '#1C1510';
const MUTED = '#8A7564';
const BG = '#FDFAF4';

const TRENDING = ['Bague Or', 'Collier Diamant', 'Montre Lagune', 'Alliance'];

export default function Search() {
  const navigate = useNavigate();
  const { colors } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = colors;
  const products = useProducts();
  const [query, setQuery] = useState('');
  const [recentSearches] = useState(['Bague lumière', 'Jonc royal', 'Boucles ivoire']);

  const results = query.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.collection.toLowerCase().includes(query.toLowerCase()) ||
        p.category.includes(query.toLowerCase())
      )
    : [];

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 pt-12 lg:pt-4 px-4 pb-4"
        style={{ background: 'rgba(253,250,244,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-3 lg:max-w-[800px] lg:mx-auto">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            whileTap={{ scale: 0.88 }}
          >
            <ArrowLeft size={18} color={TEXT} />
          </motion.button>
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <SearchIcon size={16} color={MUTED} />
            <input
              type="text"
              placeholder="Rechercher un bijou..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={14} color={MUTED} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:max-w-[800px] lg:mx-auto px-4 py-4 pb-28 lg:pb-8">
        <AnimatePresence mode="wait">
          {query.length < 2 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Trending */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} color={GOLD} />
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Tendances
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t, i) => (
                    <motion.button
                      key={t}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setQuery(t)}
                      className="px-4 py-2 rounded-full"
                      whileTap={{ scale: 0.94 }}
                      style={{
                        background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)',
                        border: `1px solid rgba(201,162,39,0.25)`,
                        color: TEXT,
                        fontWeight: 500,
                        fontSize: '12px',
                      }}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} color={MUTED} />
                  <span style={{ color: MUTED, fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Recherches récentes
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {recentSearches.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      onClick={() => setQuery(s)}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span style={{ color: TEXT, fontSize: '14px' }}>{s}</span>
                      <ArrowLeft size={14} color={MUTED} style={{ transform: 'rotate(180deg)' }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {results.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-4">
                  <SearchIcon size={48} color={MUTED} />
                  <p style={{ color: MUTED, fontSize: '14px' }}>Aucun résultat pour "{query}"</p>
                  <button
                    onClick={() => navigate('/collection')}
                    style={{ color: GOLD, fontWeight: 600, fontSize: '13px' }}
                  >
                    Voir toute la collection →
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ color: MUTED, fontSize: '12px', marginBottom: '16px' }}>
                    <span style={{ color: GOLD, fontWeight: 700 }}>{results.length}</span> résultat{results.length > 1 ? 's' : ''} pour "{query}"
                  </p>
                  <div className="flex flex-col gap-3">
                    {results.map((product, idx) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex gap-3 p-3 rounded-2xl text-left"
                        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p style={{ color: GOLD, fontWeight: 700, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
                            {product.collection}
                          </p>
                          <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                            {product.name}
                          </p>
                          <p style={{ color: GOLD, fontWeight: 800, fontSize: '14px' }}>{formatPrice(product.price)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}