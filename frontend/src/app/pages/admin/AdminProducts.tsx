import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Trash2, Plus, Search, Package, AlertTriangle, Star, Zap, Sparkles } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { categories, formatPrice } from '../../data/products';
import { useColors } from '../../context/AppContext';

type ApiProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  collection: string;
  description: string;
  price: number;
  stock: number | null;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
};

export default function AdminProducts() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/products'));
      if (!res.ok) throw new Error('Failed');
      const data = await res.json() as ApiProduct[];
      setProducts(data);
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await fetch(apiUrl(`/api/products/${id}`), { method: 'DELETE' });
      await reload();
    } finally {
      setConfirmDelete(null);
      setIsDeleting(false);
    }
  };

  const handleToggle = async (product: ApiProduct, field: 'isNew' | 'isBestseller' | 'isFeatured') => {
    const key = `${product.id}-${field}`;
    setToggling(key);
    try {
      await fetch(apiUrl(`/api/products/${product.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !product[field] }),
      });
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, [field]: !p[field] } : p)
      );
    } finally {
      setToggling(null);
    }
  };

  const filtered = products.filter(p => {
    const matchCat = filterCat === 'all' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-48"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <Search size={14} color={MUTED} />
          <input
            placeholder="Rechercher un produit…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-1"
            style={{ color: TEXT, fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[{ id: 'all', label: 'Tous' }, ...categories.filter(c => c.id !== 'all')].map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              style={{
                padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
                background: filterCat === cat.id ? 'rgba(201,162,39,0.15)' : CARD_BG,
                border: `1px solid ${filterCat === cat.id ? 'rgba(201,162,39,0.4)' : BORDER}`,
                color: filterCat === cat.id ? GOLD : MUTED,
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total produits', value: products.length, icon: Package },
          { label: 'Résultats filtrés', value: filtered.length, icon: Search },
          { label: 'Stock critique (≤3)', value: products.filter(p => p.stock !== null && p.stock <= 3).length, icon: AlertTriangle, warn: true },
        ].map(({ label, value, icon: Icon, warn }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: CARD_BG, border: `1px solid ${warn && value > 0 ? 'rgba(239,68,68,0.3)' : BORDER}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} color={warn && value > 0 ? '#ef4444' : MUTED} />
              <span style={{ color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{label}</span>
            </div>
            <p style={{ color: warn && value > 0 ? '#ef4444' : TEXT, fontSize: '24px', fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Product Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <div className="grid gap-0">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_120px_110px_70px_130px_90px] px-5 py-3"
            style={{ background: CARD_BG, borderBottom: `1px solid ${BORDER}` }}>
            {['Photo', 'Produit', 'Catégorie', 'Prix', 'Stock', 'Badges', 'Actions'].map(h => (
              <span key={h} style={{ color: MUTED, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <p style={{ color: MUTED, fontFamily: 'Manrope, sans-serif', fontSize: '13px' }}>
                Chargement des produits…
              </p>
            </div>
          )}

          {/* Rows */}
          {!loading && (
            <AnimatePresence>
              {filtered.map((product, i) => {
                const stockLow = product.stock !== null && product.stock <= 3;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-[60px_1fr_120px_110px_70px_130px_90px] px-5 py-4 items-center"
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
                      background: i % 2 === 0 ? BG : CARD_BG,
                    }}
                  >
                    {/* Image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: `1px solid ${BORDER}` }}>
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover" />
                    </div>

                    {/* Name + collection */}
                    <div className="pr-4">
                      <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                        {product.name}
                      </p>
                      <p style={{ color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
                        {product.collection}
                      </p>
                    </div>

                    {/* Category */}
                    <span style={{ color: MUTED, fontSize: '12px', fontFamily: 'Manrope, sans-serif', textTransform: 'capitalize' }}>
                      {product.category}
                    </span>

                    {/* Price */}
                    <span style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                      {formatPrice(product.price)}
                    </span>

                    {/* Stock */}
                    <span style={{ color: stockLow ? '#ef4444' : TEXT, fontSize: '13px', fontWeight: stockLow ? 700 : 500, fontFamily: 'Manrope, sans-serif' }}>
                      {product.stock === null ? '∞' : product.stock}
                    </span>

                    {/* Badges — quick toggle */}
                    <div className="flex items-center gap-1">
                      {([
                        { field: 'isNew' as const, icon: Sparkles, color: '#C9A227', title: 'Nouveau' },
                        { field: 'isBestseller' as const, icon: Star, color: '#22c55e', title: 'Bestseller' },
                        { field: 'isFeatured' as const, icon: Zap, color: '#a78bfa', title: 'En vedette' },
                      ]).map(({ field, icon: Icon, color, title }) => {
                        const active = product[field];
                        const key = `${product.id}-${field}`;
                        return (
                          <motion.button
                            key={field}
                            whileTap={{ scale: 0.82 }}
                            title={title}
                            disabled={toggling === key}
                            onClick={() => handleToggle(product, field)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{
                              background: active ? `${color}20` : 'transparent',
                              border: `1px solid ${active ? color : BORDER}`,
                              cursor: toggling === key ? 'wait' : 'pointer',
                              opacity: toggling === key ? 0.5 : 1,
                            }}>
                            <Icon size={11} color={active ? color : MUTED} />
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', cursor: 'pointer' }}>
                        <Pencil size={13} color="#C9A227" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setConfirmDelete(product.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                        <Trash2 size={13} color="#ef4444" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Package size={40} color={BORDER} />
              <p style={{ color: MUTED, marginTop: '12px', fontFamily: 'Manrope, sans-serif', fontSize: '13px' }}>
                Aucun produit trouvé
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAB add */}
      <motion.button
        whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.04 }}
        onClick={() => navigate('/admin/products/new')}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', boxShadow: '0 8px 24px rgba(201,162,39,0.4)', border: 'none', cursor: 'pointer' }}>
        <Plus size={22} color="#fff" />
      </motion.button>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="rounded-3xl p-8 max-w-sm w-full"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 style={{ color: TEXT, fontWeight: 800, fontSize: '18px', textAlign: 'center', marginBottom: '8px', fontFamily: 'Manrope, sans-serif' }}>
                Supprimer le produit ?
              </h3>
              <p style={{ color: MUTED, fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontFamily: 'Manrope, sans-serif' }}>
                Ce produit sera définitivement supprimé de la base de données.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '14px', background: BG, border: `1px solid ${BORDER}`, color: MUTED, fontWeight: 600, fontSize: '13px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDelete)} disabled={isDeleting}
                  style={{ flex: 1, padding: '12px', borderRadius: '14px', background: isDeleting ? BORDER : '#ef4444', border: 'none', color: isDeleting ? MUTED : '#fff', fontWeight: 700, fontSize: '13px', fontFamily: 'Manrope, sans-serif', cursor: isDeleting ? 'not-allowed' : 'pointer' }}>
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
