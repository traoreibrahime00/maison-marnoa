import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Trash2, Plus, Search, Package, Star, AlertTriangle } from 'lucide-react';
import {
  getMergedProducts, deleteProduct, isStaticProduct,
} from '../../data/productStore';
import { Product, categories, formatPrice } from '../../data/products';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reload = () => setProducts(getMergedProducts());
  useEffect(() => { reload(); }, []);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    reload();
    setConfirmDelete(null);
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
          style={{ background: '#1E1A12', border: '1px solid #3A2E1E' }}>
          <Search size={14} color="#9A8A74" />
          <input
            placeholder="Rechercher un produit…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-1"
            style={{ color: '#F5EFE0', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[{ id: 'all', label: 'Tous' }, ...categories.filter(c => c.id !== 'all')].map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              style={{
                padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
                background: filterCat === cat.id ? 'rgba(201,162,39,0.15)' : '#1E1A12',
                border: `1px solid ${filterCat === cat.id ? 'rgba(201,162,39,0.4)' : '#3A2E1E'}`,
                color: filterCat === cat.id ? '#C9A227' : '#9A8A74',
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
          { label: 'Stock critique (≤3)', value: products.filter(p => (p.stock ?? 99) <= 3).length, icon: AlertTriangle, warn: true },
        ].map(({ label, value, icon: Icon, warn }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: '#1E1A12', border: `1px solid ${warn && value > 0 ? 'rgba(239,68,68,0.3)' : '#3A2E1E'}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} color={warn && value > 0 ? '#ef4444' : '#9A8A74'} />
              <span style={{ color: '#9A8A74', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{label}</span>
            </div>
            <p style={{ color: warn && value > 0 ? '#ef4444' : '#F5EFE0', fontSize: '24px', fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Product Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #3A2E1E' }}>
        <div className="grid gap-0">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_130px_110px_80px_90px_100px] px-5 py-3"
            style={{ background: '#1E1A12', borderBottom: '1px solid #3A2E1E' }}>
            {['Photo', 'Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => (
              <span key={h} style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <AnimatePresence>
            {filtered.map((product, i) => {
              const isStatic = isStaticProduct(product.id);
              const stockLow  = (product.stock ?? 99) <= 3;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-[60px_1fr_130px_110px_80px_90px_100px] px-5 py-4 items-center"
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #2A2218' : 'none',
                    background: i % 2 === 0 ? '#1A1410' : '#1E1A12',
                  }}
                >
                  {/* Image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid #3A2E1E' }}>
                    <img src={product.image} alt={product.name}
                      className="w-full h-full object-cover" />
                  </div>

                  {/* Name + collection */}
                  <div className="pr-4">
                    <p style={{ color: '#F5EFE0', fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                      {product.name}
                    </p>
                    <p style={{ color: '#9A8A74', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
                      {product.collection}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {product.isNew && <span style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>NOUVEAU</span>}
                      {product.isBestseller && <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>BESTSELLER</span>}
                    </div>
                  </div>

                  {/* Category */}
                  <span style={{ color: '#9A8A74', fontSize: '12px', fontFamily: 'Manrope, sans-serif', textTransform: 'capitalize' }}>
                    {product.category}
                  </span>

                  {/* Price */}
                  <span style={{ color: '#C9A227', fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                    {formatPrice(product.price)}
                  </span>

                  {/* Stock */}
                  <span style={{ color: stockLow ? '#ef4444' : '#F5EFE0', fontSize: '13px', fontWeight: stockLow ? 700 : 500, fontFamily: 'Manrope, sans-serif' }}>
                    {product.stock ?? '∞'}
                  </span>

                  {/* Status */}
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                    background: isStatic ? 'rgba(148,163,184,0.1)' : 'rgba(201,162,39,0.12)',
                    color: isStatic ? '#94a3b8' : '#C9A227',
                    fontFamily: 'Manrope, sans-serif',
                  }}>
                    {isStatic ? 'STATIQUE' : 'CUSTOM'}
                  </span>

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

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Package size={40} color="#3A2E1E" />
              <p style={{ color: '#9A8A74', marginTop: '12px', fontFamily: 'Manrope, sans-serif', fontSize: '13px' }}>
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
              style={{ background: '#1E1A12', border: '1px solid #3A2E1E' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 style={{ color: '#F5EFE0', fontWeight: 800, fontSize: '18px', textAlign: 'center', marginBottom: '8px', fontFamily: 'Manrope, sans-serif' }}>
                Supprimer le produit ?
              </h3>
              <p style={{ color: '#9A8A74', fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontFamily: 'Manrope, sans-serif' }}>
                {isStaticProduct(confirmDelete)
                  ? 'Ce produit sera masqué du catalogue (vous pourrez le réactiver).'
                  : 'Ce produit sera définitivement supprimé.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#2A2218', border: '1px solid #3A2E1E', color: '#9A8A74', fontWeight: 600, fontSize: '13px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
