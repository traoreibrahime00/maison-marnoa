import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, X, Plus, Check, ImagePlus, Upload, Cloud, AlertCircle,
} from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { uploadFilesToCloudinary, isCloudinaryConfigured, type UploadProgress } from '../../lib/cloudinary';
import { ProductCategory, categories } from '../../data/products';

const METALS = ['Or Jaune 18K', 'Or Blanc 18K', 'Or Rose 18K', 'Or Jaune 14K', 'Or Blanc 14K', 'Argent 925', 'Platine', 'Acier inoxydable'];
const COLLECTIONS = ['COLLECTION ROYALE', 'COLLECTION PRESTIGE', 'COLLECTION IVOIRE', 'COLLECTION MARIAGE', 'COLLECTION ESSENTIELLE', 'HAUTE HORLOGERIE'];
const SIZE_OPTIONS = [44, 46, 48, 50, 52, 54, 56, 58, 60, 62];

interface FormData {
  name: string;
  collection: string;
  customCollection: string;
  category: ProductCategory;
  price: string;
  material: string;
  customMaterial: string;
  weight: string;
  description: string;
  stock: string;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  sizes: number[];
  images: string[];
  colorVariants: { id: string; name: string; hexColor: string; label: string }[];
}

const EMPTY_FORM: FormData = {
  name: '', collection: '', customCollection: '', category: 'bague',
  price: '', material: '', customMaterial: '', weight: '',
  description: '', stock: '', isNew: false, isBestseller: false, isFeatured: false,
  sizes: [], images: [], colorVariants: [],
};

type ApiProduct = {
  id: string; name: string; image: string; category: string; collection: string;
  description: string; price: number; stock: number | null;
  isNew: boolean; isBestseller: boolean; isFeatured: boolean;
  material?: string; weight?: string; sizes?: number[];
  images?: string[];
  colorVariants?: { id: string; name: string; hexColor: string; label: string }[];
};

function productToForm(p: ApiProduct): FormData {
  const knownMetal = METALS.includes(p.material ?? '');
  const knownColl = COLLECTIONS.includes(p.collection);
  return {
    name: p.name,
    collection: knownColl ? p.collection : '__custom__',
    customCollection: knownColl ? '' : p.collection,
    category: p.category as ProductCategory,
    price: String(p.price),
    material: knownMetal ? (p.material ?? '') : '__custom__',
    customMaterial: knownMetal ? '' : (p.material ?? ''),
    weight: p.weight ?? '',
    description: p.description,
    stock: p.stock !== null && p.stock !== undefined ? String(p.stock) : '',
    isNew: !!p.isNew,
    isBestseller: !!p.isBestseller,
    isFeatured: !!p.isFeatured,
    sizes: p.sizes ?? [],
    images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    colorVariants: p.colorVariants ?? [],
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

/* ─── Upload progress bar ────────────────────────────────── */
function ProgressBar({ progress, label, error }: { progress: number; label: string; error?: string }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div className="flex justify-between mb-1">
        <span style={{ color: '#9A8A74', fontSize: '10px', fontFamily: 'Manrope, sans-serif' }} className="truncate max-w-[70%]">
          {label}
        </span>
        <span style={{ color: error ? '#ef4444' : '#C9A227', fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>
          {error ? 'Erreur' : `${progress}%`}
        </span>
      </div>
      <div style={{ height: '3px', background: '#3A2E1E', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          width: `${progress}%`, height: '100%', borderRadius: '2px',
          background: error ? '#ef4444' : progress === 100 ? '#22c55e' : '#C9A227',
          transition: 'width 0.2s ease',
        }} />
      </div>
    </div>
  );
}

/* ─── Photo manager ──────────────────────────────────────── */
function PhotoManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [addMode, setAddMode] = useState<'upload' | 'url' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadError, setUploadError] = useState('');

  const cloudinaryReady = isCloudinaryConfigured();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (fileRef.current) fileRef.current.value = '';

    if (!cloudinaryReady) {
      // Fallback: base64 (dev mode without Cloudinary configured)
      const readers = files.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      const results = await Promise.allSettled(readers);
      const urls = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<string>).value);
      onChange([...images, ...urls]);
      setAddMode(null);
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(files.map(f => ({ file: f.name, progress: 0 })));

    try {
      const urls = await uploadFilesToCloudinary(files, setUploadProgress);
      onChange([...images, ...urls]);
      setAddMode(null);
    } catch {
      setUploadError('Une ou plusieurs images n\'ont pas pu être uploadées.');
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  const addFromUrl = () => {
    if (urlInput.trim()) { onChange([...images, urlInput.trim()]); setUrlInput(''); setAddMode(null); }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const moveFirst = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next);
  };

  return (
    <div>
      {/* Cloudinary status badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: cloudinaryReady ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${cloudinaryReady ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
          <Cloud size={11} color={cloudinaryReady ? '#22c55e' : '#f59e0b'} />
          <span style={{ color: cloudinaryReady ? '#22c55e' : '#f59e0b', fontSize: '10px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
            {cloudinaryReady ? 'Cloudinary connecté' : 'Cloudinary non configuré — mode local (base64)'}
          </span>
        </div>
      </div>

      {/* Current photos */}
      <div className="flex flex-wrap gap-3 mb-4">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <div className="w-24 h-24 rounded-xl overflow-hidden"
              style={{ border: i === 0 ? '2px solid #C9A227' : '1px solid #3A2E1E' }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
            {i === 0 && (
              <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#C9A227', color: '#fff', fontSize: '8px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', fontFamily: 'Manrope, sans-serif' }}>
                PRINCIPALE
              </span>
            )}
            {/* Set as main */}
            {i > 0 && (
              <button
                onClick={() => moveFirst(i)}
                title="Définir comme photo principale"
                className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100"
                style={{ background: 'rgba(201,162,39,0.85)', color: '#fff', fontSize: '7px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'opacity 0.15s', fontFamily: 'Manrope, sans-serif' }}>
                Principale
              </button>
            )}
            <button onClick={() => remove(i)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
              style={{ background: '#ef4444', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}>
              <X size={10} color="#fff" />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        <motion.button whileTap={{ scale: 0.95 }} disabled={uploading}
          onClick={() => setAddMode(addMode ? null : 'upload')}
          className="w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1"
          style={{ border: '2px dashed #3A2E1E', background: 'rgba(201,162,39,0.04)', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}>
          <ImagePlus size={18} color="#C9A227" />
          <span style={{ color: '#9A8A74', fontSize: '9px', fontFamily: 'Manrope, sans-serif' }}>Ajouter</span>
        </motion.button>
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {uploading && uploadProgress.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl p-4 mb-3" style={{ background: '#2A2218', border: '1px solid #3A2E1E' }}>
            <p style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', marginBottom: '10px' }}>
              Upload Cloudinary en cours…
            </p>
            {uploadProgress.map((p, i) => (
              <ProgressBar key={i} progress={p.progress} label={p.file} error={p.error} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {uploadError && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={12} color="#ef4444" />
          <span style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{uploadError}</span>
        </div>
      )}

      {/* Add options */}
      <AnimatePresence>
        {addMode && !uploading && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-4 mb-3" style={{ background: '#2A2218', border: '1px solid #3A2E1E' }}>
            <div className="flex gap-2 mb-3">
              {(['upload', 'url'] as const).map(mode => (
                <button key={mode} onClick={() => setAddMode(mode)}
                  style={{ padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
                    background: addMode === mode ? 'rgba(201,162,39,0.15)' : 'transparent',
                    border: `1px solid ${addMode === mode ? '#C9A227' : '#3A2E1E'}`,
                    color: addMode === mode ? '#C9A227' : '#9A8A74' }}>
                  {mode === 'upload' ? "📁 Depuis l'ordinateur" : '🔗 URL externe'}
                </button>
              ))}
            </div>

            {addMode === 'upload' && (
              <>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl w-full justify-center"
                  style={{ background: 'rgba(201,162,39,0.1)', border: '1px dashed rgba(201,162,39,0.3)', cursor: 'pointer', color: '#C9A227', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                  <Upload size={16} />
                  {cloudinaryReady ? 'Sélectionner et uploader sur Cloudinary' : 'Sélectionner des photos'}
                </motion.button>
                {!cloudinaryReady && (
                  <p style={{ color: '#f59e0b', fontSize: '10px', marginTop: '8px', fontFamily: 'Manrope, sans-serif' }}>
                    ⚠️ Cloudinary non configuré : les images seront stockées en base64 (déconseillé en production).
                  </p>
                )}
              </>
            )}

            {addMode === 'url' && (
              <div className="flex gap-2">
                <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://res.cloudinary.com/… ou URL externe"
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

      {images.length === 0 && !uploading && (
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
  const isCreating = !id || id === 'new';

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!isCreating && id) {
      fetch(apiUrl(`/api/products/${id}`))
        .then(r => r.ok ? r.json() : Promise.reject('not found'))
        .then((p: ApiProduct) => setForm(productToForm(p)))
        .catch(() => setLoadError('Produit introuvable.'));
    }
  }, [id, isCreating]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Prix invalide';
    if (form.images.length === 0) e.images = 'Au moins une photo requise';
    const finalCollection = form.collection === '__custom__' ? form.customCollection : form.collection;
    if (!finalCollection.trim()) e.collection = 'Collection requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);

    const finalCollection = form.collection === '__custom__' ? form.customCollection : form.collection;
    const finalMaterial = form.material === '__custom__' ? form.customMaterial : form.material;

    const payload = {
      ...(isCreating ? { id: crypto.randomUUID() } : {}),
      name: form.name.trim(),
      collection: finalCollection.trim(),
      category: form.category,
      price: Number(form.price),
      image: form.images[0] ?? '',
      images: form.images,
      description: form.description.trim(),
      material: finalMaterial,
      weight: form.weight,
      sizes: form.sizes,
      colorVariants: form.colorVariants,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      isFeatured: form.isFeatured,
      stock: form.stock ? Number(form.stock) : null,
    };

    try {
      const url = isCreating ? apiUrl('/api/products') : apiUrl(`/api/products/${id}`);
      const method = isCreating ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Erreur serveur');
      }

      setSaved(true);
      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err) {
      console.error('Failed to save product:', err);
      setErrors(prev => ({ ...prev, name: err instanceof Error ? err.message : 'Erreur lors de la sauvegarde' }));
    } finally {
      setIsSaving(false);
    }
  };

  const S = {
    card: { background: '#1E1A12', border: '1px solid #3A2E1E', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
    sectionTitle: { color: '#C9A227', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, fontFamily: 'Manrope, sans-serif', marginBottom: '16px' },
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p style={{ color: '#ef4444', fontFamily: 'Manrope, sans-serif' }}>{loadError}</p>
        <button onClick={() => navigate('/admin/products')}
          style={{ marginTop: '16px', color: '#C9A227', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
          ← Retour aux produits
        </button>
      </div>
    );
  }

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
            {isCreating ? 'Nouveau produit' : 'Modifier le produit'}
          </h2>
          {!isCreating && <p style={{ color: '#9A8A74', fontSize: '12px', fontFamily: 'Manrope, sans-serif', marginTop: '2px' }}>ID : {id}</p>}
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

            <Field label="Collection *">
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
              {errors.collection && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>{errors.collection}</p>}
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix (FCFA) *">
              <Input type="number" value={form.price} onChange={v => set('price', v)} placeholder="450000" />
              {errors.price && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>{errors.price}</p>}
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
              <Field label="Tailles disponibles" hint="Pour bagues et alliances.">
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
          <motion.button whileTap={{ scale: isSaving ? 1 : 0.97 }} onClick={handleSave} disabled={isSaving}
            className="flex items-center justify-center gap-2"
            style={{ flex: 2, padding: '14px', borderRadius: '14px', background: saved ? '#22c55e' : isSaving ? '#3A2E1E' : 'linear-gradient(135deg,#C9A227,#E8C84A)', border: 'none', color: isSaving ? '#9A8A74' : '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'Manrope, sans-serif', cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: isSaving ? 'none' : '0 8px 24px rgba(201,162,39,0.3)' }}>
            {saved ? <><Check size={16} /> Enregistré !</> : isSaving ? 'Sauvegarde...' : (isCreating ? 'Créer le produit' : 'Enregistrer les modifications')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
