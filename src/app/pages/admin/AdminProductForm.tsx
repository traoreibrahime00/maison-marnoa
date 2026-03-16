import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Upload, X, Plus, GripVertical, Check, ImagePlus, Link, Trash2,
} from 'lucide-react';
import {
  getMergedProducts, saveCustomProduct, saveProductOverride,
  generateProductId, isStaticProduct,
} from '../../data/productStore';
import { Product, ProductCategory, categories } from '../../data/products';

const METALS = ['Or Jaune 18K', 'Or Blanc 18K', 'Or Rose 18K', 'Or Jaune 14K', 'Or Blanc 14K', 'Argent 925', 'Platine', 'Acier inoxydable'];
const COLLECTIONS = ['COLLECTION ROYALE', 'COLLECTION PRESTIGE', 'COLLECTION IVOIRE', 'COLLECTION MARIAGE', 'COLLECTION ESSENTIELLE', 'HAUTE HORLOGERIE'];
const SIZE_OPTIONS = [44, 46, 48, 50, 52, 54, 56, 58, 60, 62];

interface FormData {
  name: string;
  collection: string;
  customCollection: string;
  category: ProductCategory;
  price: string;
  originalPrice: string;
  material: string;
  customMaterial: string;
  weight: string;
  description: string;
  stock: string;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  sizes: number[];
  images: string[]; // base64 or URL
  colorVariants: { id: string; name: string; hexColor: string; label: string }[];
}

const EMPTY_FORM: FormData = {
  name: '', collection: '', customCollection: '', category: 'bague',
  price: '', originalPrice: '', material: '', customMaterial: '', weight: '',
  description: '', stock: '', isNew: false, isBestseller: false, isFeatured: false,
  sizes: [], images: [], colorVariants: [],
};

function productToForm(p: Product): FormData {
  const knownMetal = METALS.includes(p.material);
  const knownColl  = COLLECTIONS.includes(p.collection);
  return {
    name: p.name, collection: knownColl ? p.collection : '__custom__',
    customCollection: knownColl ? '' : p.collection,
    category: p.category, price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    material: knownMetal ? p.material : '__custom__',
    customMaterial: knownMetal ? '' : p.material,
    weight: p.weight ?? '', description: p.description, stock: String(p.stock ?? ''),
    isNew: !!p.isNew, isBestseller: !!p.isBestseller, isFeatured: !!p.isFeatured,
    sizes: p.sizes ?? [], images: p.images ?? [p.image],
    colorVariants: p.colorVariants ?? [],
  };
}

function formToProduct(form: FormData, id: string): Product {
  const finalCollection = form.collection === '__custom__' ? form.customCollection : form.collection;
  const finalMaterial   = form.material   === '__custom__' ? form.customMaterial   : form.material;
  return {
    id, name: form.name, collection: finalCollection, category: form.category,
    price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    image: form.images[0] ?? '', images: form.images,
    description: form.description, material: finalMaterial,
    weight: form.weight, sizes: form.sizes.length > 0 ? form.sizes : undefined,
    rating: 4.5, reviews: 0,
    isNew: form.isNew || undefined, isBestseller: form.isBestseller || undefined,
    isFeatured: form.isFeatured || undefined,
    stock: form.stock ? Number(form.stock) : undefined,
    colorVariants: form.colorVariants.length > 0 ? form.colorVariants : undefined,
  };
}

/* ─── Sub-components ─────────────────────────────────────── */

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontFamily: 'Manrope, sans-serif' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ color: '#5A4E3E', fontSize: '10px', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', style: s }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; style?: React.CSSProperties;
}) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: '#2A2218', border: '1px solid #3A2E1E', borderRadius: '12px', padding: '10px 14px', color: '#F5EFE0', fontSize: '13px', fontFamily: 'Manrope, sans-serif', outline: 'none', boxSizing: 'border-box', ...s }}
    />
  );
}

function Select({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', background: '#2A2218', border: '1px solid #3A2E1E', borderRadius: '12px', padding: '10px 14px', color: '#F5EFE0', fontSize: '13px', fontFamily: 'Manrope, sans-serif', outline: 'none', cursor: 'pointer' }}>
      {children}
    </select>
  );
}

/* ─── Photo manager ──────────────────────────────────────── */
function PhotoManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [addMode, setAddMode] = useState<'upload' | 'url' | null>(null);
  const [warning, setWarning] = useState('');

  const addFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const readers = files.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    Promise.allSettled(readers).then(results => {
      const ok = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<string>).value);
      onChange([...images, ...ok]);
    });
    setAddMode(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const addFromUrl = () => {
    if (urlInput.trim()) { onChange([...images, urlInput.trim()]); setUrlInput(''); setAddMode(null); }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Current photos */}
      <div className="flex flex-wrap gap-3 mb-4">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <div className={`w-24 h-24 rounded-xl overflow-hidden`}
              style={{ border: i === 0 ? '2px solid #C9A227' : '1px solid #3A2E1E' }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
            {i === 0 && (
              <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#C9A227', color: '#fff', fontSize: '8px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', fontFamily: 'Manrope, sans-serif' }}>
                PRINCIPALE
              </span>
            )}
            <button onClick={() => remove(i)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
              style={{ background: '#ef4444', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}>
              <X size={10} color="#fff" />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setAddMode(addMode ? null : 'upload')}
          className="w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1"
          style={{ border: '2px dashed #3A2E1E', background: 'rgba(201,162,39,0.04)', cursor: 'pointer' }}>
          <ImagePlus size={18} color="#C9A227" />
          <span style={{ color: '#9A8A74', fontSize: '9px', fontFamily: 'Manrope, sans-serif' }}>Ajouter</span>
        </motion.button>
      </div>

      {/* Add options */}
      <AnimatePresence>
        {addMode && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-4 mb-3" style={{ background: '#2A2218', border: '1px solid #3A2E1E' }}>
            <div className="flex gap-2 mb-3">
              {(['upload', 'url'] as const).map(mode => (
                <button key={mode} onClick={() => setAddMode(mode)}
                  style={{ padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
                    background: addMode === mode ? 'rgba(201,162,39,0.15)' : 'transparent',
                    border: `1px solid ${addMode === mode ? '#C9A227' : '#3A2E1E'}`,
                    color: addMode === mode ? '#C9A227' : '#9A8A74' }}>
                  {mode === 'upload' ? '📁 Depuis l\'ordinateur' : '🔗 URL externe'}
                </button>
              ))}
            </div>
            {addMode === 'upload' && (
              <>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFromFile} style={{ display: 'none' }} />
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl w-full justify-center"
                  style={{ background: 'rgba(201,162,39,0.1)', border: '1px dashed rgba(201,162,39,0.3)', cursor: 'pointer', color: '#C9A227', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                  <Upload size={16} /> Sélectionner des photos (max 5 Mo par fichier recommandé)
                </motion.button>
              </>
            )}
            {addMode === 'url' && (
              <div className="flex gap-2">
                <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/…"
                  onKeyDown={e => e.key === 'Enter' && addFromUrl()}
                  style={{ flex: 1, background: '#1E1A12', border: '1px solid #3A2E1E', borderRadius: '10px', padding: '10px 14px', color: '#F5EFE0', fontSize: '13px', fontFamily: 'Manrope, sans-serif', outline: 'none' }} />
                <motion.button whileTap={{ scale: 0.95 }} onClick={addFromUrl}
                  style={{ padding: '10px 16px', borderRadius: '10px', background: '#C9A227', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
                  Ajouter
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {warning && (
        <p style={{ color: '#f59e0b', fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginBottom: '8px' }}>
          ⚠️ {warning}
        </p>
      )}

      {images.length === 0 && (
        <p style={{ color: '#5A4E3E', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
          Aucune photo. La première photo ajoutée sera la photo principale.
        </p>
      )}
    </div>
  );
}

/* ─── Main Form ──────────────────────────────────────────── */
export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Load existing product for edit
  useEffect(() => {
    if (!isNew && id) {
      const p = getMergedProducts().find(p => p.id === id);
      if (p) setForm(productToForm(p));
    }
  }, [id, isNew]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Prix invalide';
    if (form.images.length === 0) e.images = 'Au moins une photo requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const productId = isNew ? generateProductId() : id!;
    const product   = formToProduct(form, productId);

    if (isNew || !isStaticProduct(productId)) {
      saveCustomProduct(product);
    } else {
      // For static products we save a full override (all fields)
      const { id: _id, ...rest } = product;
      saveProductOverride(productId, rest);
    }

    setSaved(true);
    setTimeout(() => navigate('/admin/products'), 1200);
  };

  const S = { // dark-theme style helpers
    card: { background: '#1E1A12', border: '1px solid #3A2E1E', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
    sectionTitle: { color: '#C9A227', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, fontFamily: 'Manrope, sans-serif', marginBottom: '16px' },
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => navigate('/admin/products')}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#1E1A12', border: '1px solid #3A2E1E', cursor: 'pointer' }}>
          <ArrowLeft size={16} color="#9A8A74" />
        </motion.button>
        <div>
          <h2 style={{ color: '#F5EFE0', fontWeight: 800, fontSize: '22px', fontFamily: 'Manrope, sans-serif', lineHeight: 1 }}>
            {isNew ? 'Nouveau produit' : 'Modifier le produit'}
          </h2>
          {!isNew && <p style={{ color: '#9A8A74', fontSize: '12px', fontFamily: 'Manrope, sans-serif', marginTop: '2px' }}>ID : {id}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── Photos ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Photos du produit</p>
          <PhotoManager images={form.images} onChange={v => set('images', v)} />
          {errors.images && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px', fontFamily: 'Manrope, sans-serif' }}>{errors.images}</p>}
        </div>

        {/* ── General Info ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Informations générales</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nom du produit *">
                <Input value={form.name} onChange={v => set('name', v)} placeholder="Bague Lumière d'Assinie" />
                {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>{errors.name}</p>}
              </Field>
            </div>

            <Field label="Collection">
              <Select value={form.collection} onChange={v => set('collection', v)}>
                <option value="">— Choisir —</option>
                {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">Autre (saisir)</option>
              </Select>
              {form.collection === '__custom__' && (
                <div style={{ marginTop: '8px' }}>
                  <Input value={form.customCollection} onChange={v => set('customCollection', v)} placeholder="Ma nouvelle collection" />
                </div>
              )}
            </Field>

            <Field label="Catégorie">
              <Select value={form.category} onChange={v => set('category', v as ProductCategory)}>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>

            <div className="col-span-2">
              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={4} placeholder="Décrivez le bijou, ses caractéristiques, son histoire…"
                  style={{ width: '100%', background: '#2A2218', border: '1px solid #3A2E1E', borderRadius: '12px', padding: '10px 14px', color: '#F5EFE0', fontSize: '13px', fontFamily: 'Manrope, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Prix & Stock ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Prix & Stock</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Prix (FCFA) *">
              <Input type="number" value={form.price} onChange={v => set('price', v)} placeholder="450000" />
              {errors.price && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>{errors.price}</p>}
            </Field>
            <Field label="Prix barré (optionnel)" hint="Affiché rayé à côté du prix">
              <Input type="number" value={form.originalPrice} onChange={v => set('originalPrice', v)} placeholder="600000" />
            </Field>
            <Field label="Quantité en stock" hint="Laissez vide = illimité">
              <Input type="number" value={form.stock} onChange={v => set('stock', v)} placeholder="10" />
            </Field>
          </div>
        </div>

        {/* ── Matière & Tailles ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Matière & Tailles</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Métal / Matériau">
              <Select value={form.material} onChange={v => set('material', v)}>
                <option value="">— Choisir —</option>
                {METALS.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="__custom__">Autre (saisir)</option>
              </Select>
              {form.material === '__custom__' && (
                <div style={{ marginTop: '8px' }}>
                  <Input value={form.customMaterial} onChange={v => set('customMaterial', v)} placeholder="Ex: Titane, Inox…" />
                </div>
              )}
            </Field>
            <Field label="Poids">
              <Input value={form.weight} onChange={v => set('weight', v)} placeholder="7.2 Grammes" />
            </Field>

            <div className="col-span-2">
              <Field label="Tailles disponibles" hint="Pour bagues et alliances. Laissez vide si non applicable.">
                <div className="flex flex-wrap gap-2 mt-1">
                  {SIZE_OPTIONS.map(sz => {
                    const active = form.sizes.includes(sz);
                    return (
                      <button key={sz}
                        onClick={() => set('sizes', active ? form.sizes.filter(s => s !== sz) : [...form.sizes, sz].sort((a, b) => a - b))}
                        style={{ width: '44px', height: '44px', borderRadius: '10px', fontSize: '13px', fontWeight: active ? 700 : 400, fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
                          background: active ? 'rgba(201,162,39,0.15)' : '#2A2218',
                          border: `1.5px solid ${active ? '#C9A227' : '#3A2E1E'}`,
                          color: active ? '#C9A227' : '#9A8A74' }}>
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Badges ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Badges & Mise en avant</p>
          <div className="flex flex-wrap gap-3">
            {([
              { key: 'isNew', label: 'NOUVEAU', color: '#C9A227' },
              { key: 'isBestseller', label: 'BESTSELLER', color: '#22c55e' },
              { key: 'isFeatured', label: 'EN VEDETTE (homepage)', color: '#a78bfa' },
            ] as const).map(({ key, label, color }) => {
              const active = form[key] as boolean;
              return (
                <button key={key} onClick={() => set(key, !active)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: active ? `${color}18` : '#2A2218', border: `1.5px solid ${active ? color : '#3A2E1E'}`, color: active ? color : '#9A8A74', fontWeight: active ? 700 : 500, fontSize: '12px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
                  {active && <Check size={12} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Variantes couleur ── */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Variantes de couleur (optionnel)</p>
          <div className="flex flex-col gap-3 mb-3">
            {form.colorVariants.map((cv, i) => (
              <div key={cv.id} className="flex items-center gap-3">
                <input type="color" value={cv.hexColor}
                  onChange={e => set('colorVariants', form.colorVariants.map((v, j) => j === i ? { ...v, hexColor: e.target.value } : v))}
                  style={{ width: '40px', height: '36px', borderRadius: '8px', border: '1px solid #3A2E1E', cursor: 'pointer', background: 'none' }} />
                <input value={cv.label} placeholder="Label (ex: Or Jaune 18K)"
                  onChange={e => set('colorVariants', form.colorVariants.map((v, j) => j === i ? { ...v, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '-') } : v))}
                  style={{ flex: 1, background: '#2A2218', border: '1px solid #3A2E1E', borderRadius: '10px', padding: '8px 12px', color: '#F5EFE0', fontSize: '13px', fontFamily: 'Manrope, sans-serif', outline: 'none' }} />
                <button onClick={() => set('colorVariants', form.colorVariants.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A74' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => set('colorVariants', [...form.colorVariants, { id: `cv_${Date.now()}`, name: '', hexColor: '#C9A227', label: '' }])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'transparent', border: '1px dashed #3A2E1E', color: '#9A8A74', fontSize: '12px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
            <Plus size={13} /> Ajouter une variante
          </motion.button>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-8">
          <button onClick={() => navigate('/admin/products')}
            style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#1E1A12', border: '1px solid #3A2E1E', color: '#9A8A74', fontWeight: 600, fontSize: '14px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
            Annuler
          </button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
            className="flex items-center justify-center gap-2"
            style={{ flex: 2, padding: '14px', borderRadius: '14px', background: saved ? '#22c55e' : 'linear-gradient(135deg,#C9A227,#E8C84A)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer', boxShadow: '0 8px 24px rgba(201,162,39,0.3)' }}>
            {saved ? <><Check size={16} /> Enregistré !</> : `${isNew ? 'Créer le produit' : 'Enregistrer les modifications'}`}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
