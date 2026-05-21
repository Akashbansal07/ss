import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import toast from 'react-hot-toast';
import {
  Lock, Upload, Trash2, Plus, X, Eye, LogOut,
  Image as ImageIcon, Loader2, Package, LayoutGrid
} from 'lucide-react';

const CATS      = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Bangles', 'Anklets', 'Sets'];
const MATERIALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'Diamond', 'Pearl', 'Mixed', 'Other'];

const EMPTY_FORM = {
  name: '', category: '', price: '', description: '',
  quantity: '', material: '', weight: '', dimensions: '',
};

/* ── Reusable field ───────────────────────────── */
function Field({ label, name, type = 'text', required, placeholder, as, value, onChange }) {
  const base = 'w-full bg-white border border-black/10 px-4 py-3 text-sm text-black placeholder-black/30 focus:outline-none focus:border-[#A8751E]/60 transition-colors rounded-none';

  return (
    <div>
      <label className="block text-[10px] text-[#A8751E] tracking-[0.3em] mb-2">
        {label.toUpperCase()}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

export default function Admin() {
  const [authed,   setAuthed]   = useState(() => sessionStorage.getItem('ss_admin') === 'true');
  const [pwd,      setPwd]      = useState('');
  const [pwdErr,   setPwdErr]   = useState('');
  const [jewels,   setJewels]   = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [images,   setImages]   = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [tab,      setTab]      = useState('upload');
  const [preview,  setPreview]  = useState(null);
  const [loadingJewels, setLoadingJewels] = useState(false);

  /* ── Dropzone ── */
  const onDrop = useCallback((accepted) => {
    setImages(prev => {
      const combined = [...prev, ...accepted];
      if (combined.length > 10) {
        toast.error('Maximum 10 images allowed');
        return combined.slice(0, 10);
      }
      return combined;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  /* ── Fetch jewels ── */
  const fetchJewels = async () => {
    setLoadingJewels(true);
    try {
      const q    = query(collection(db, 'jewelry'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setJewels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error('Failed to load jewellery');
    } finally {
      setLoadingJewels(false);
    }
  };

  useEffect(() => { if (authed) fetchJewels(); }, [authed]);

  /* ── Auth ── */
  const login = (e) => {
    e?.preventDefault();
    if (pwd === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('ss_admin', 'true');
      setAuthed(true);
      setPwdErr('');
    } else {
      setPwdErr('Incorrect password. Please try again.');
      setPwd('');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ss_admin');
    setAuthed(false);
    setPwd('');
  };

  /* ── Field change helper ── */
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Jewellery name is required');
    if (!form.price || isNaN(Number(form.price))) return toast.error('Valid price is required');
    if (!form.category) return toast.error('Please select a category');
    if (images.length === 0) return toast.error('At least one image is required');

    setUploading(true);
    const t = toast.loading('Preparing upload…');

    try {
      const jewelId = crypto.randomUUID();
      const urls    = [];

      for (let i = 0; i < images.length; i++) {
        toast.loading(`Uploading image ${i + 1} of ${images.length}…`, { id: t });
        const imgRef = ref(storage, `jewelry/${jewelId}/image_${i}`);
        await uploadBytes(imgRef, images[i]);
        urls.push(await getDownloadURL(imgRef));
      }

      toast.loading('Saving to database…', { id: t });

      await addDoc(collection(db, 'jewelry'), {
        ...form,
        price:     Number(form.price),
        quantity:  Number(form.quantity) || 0,
        images:    urls,
        jewelId,
        createdAt: serverTimestamp(),
      });

      toast.success('Jewellery added!', { id: t });
      setForm(EMPTY_FORM);
      setImages([]);
      fetchJewels();
      setTab('manage');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Check Firebase config.', { id: t });
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (jewel) => {
    if (!confirm(`Delete "${jewel.name}"? This cannot be undone.`)) return;
    setDeleting(jewel.id);
    const t = toast.loading('Deleting…');
    try {
      if (jewel.jewelId && jewel.images?.length) {
        for (let i = 0; i < jewel.images.length; i++) {
          try {
            await deleteObject(ref(storage, `jewelry/${jewel.jewelId}/image_${i}`));
          } catch {}
        }
      }
      await deleteDoc(doc(db, 'jewelry', jewel.id));
      toast.success('Deleted successfully', { id: t });
      setJewels(prev => prev.filter(j => j.id !== jewel.id));
    } catch {
      toast.error('Delete failed', { id: t });
    } finally {
      setDeleting(null);
    }
  };

  /* ════════════════════════════════════════════
     LOGIN SCREEN
  ════════════════════════════════════════════ */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 sm:px-6">
        {/* Background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(201,168,76,0.05),transparent)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-sm relative"
        >
          {/* Card */}
          <div className="border border-black/8 bg-white p-8 sm:p-10 shadow-sm">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-14 h-14 border border-[#A8751E]/30 flex items-center justify-center mx-auto mb-6">
                <Lock size={20} className="text-[#A8751E]" />
              </div>
              <p className="font-['Cormorant_Garamond',serif] text-3xl text-black tracking-widest mb-1">ADMIN</p>
              <p className="text-[#A8751E]/60 text-[9px] tracking-[0.4em]">SHRI SWASTIK PANEL</p>
            </div>

            <form onSubmit={login} className="space-y-5">
              <div>
                <label className="block text-[10px] text-[#A8751E] tracking-[0.3em] mb-2">PASSWORD</label>
                <input
                  type="password"
                  value={pwd}
                  onChange={e => { setPwd(e.target.value); setPwdErr(''); }}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-black placeholder-black/30 focus:outline-none focus:border-[#A8751E]/60 transition-colors"
                />
                {pwdErr && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-2 tracking-wide"
                  >
                    {pwdErr}
                  </motion.p>
                )}
              </div>

              <button type="submit"
                className="relative w-full inline-flex items-center justify-center gap-2 px-10 py-4
                           border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                           overflow-hidden hover:text-white group transition-colors duration-500">
                <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10">Unlock Panel</span>
              </button>
            </form>

            <p className="text-black/30 text-[10px] text-center mt-8 tracking-wider">
              This page is restricted to authorised personnel only.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     ADMIN DASHBOARD
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 border-b border-black/6 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-['Cormorant_Garamond',serif] text-lg sm:text-xl text-black tracking-widest">SHRI SWASTIK</p>
            <p className="text-[#A8751E]/60 text-[8px] tracking-[0.4em] hidden sm:block">ADMIN PANEL</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tab switcher */}
            <div className="flex border border-black/10">
              {[
                { key: 'upload', icon: <Plus size={14} />, label: 'Add' },
                { key: 'manage', icon: <LayoutGrid size={14} />, label: 'Manage' },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[10px] tracking-wider transition-all duration-200 ${
                    tab === key
                      ? 'bg-[#A8751E] text-white font-medium'
                      : 'text-black/50 hover:text-black hover:bg-black/4'
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Jewel count badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-black/8 text-[10px] text-black/40 tracking-wider">
              <Package size={12} className="text-[#A8751E]" />
              {jewels.length} pieces
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] text-black/40 hover:text-red-500 border border-black/8 hover:border-red-400/40 tracking-wider transition-all"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <AnimatePresence mode="wait">

          {/* ══ UPLOAD TAB ══ */}
          {tab === 'upload' && (
            <motion.form
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-black mb-1">Add New Jewellery</h2>
                <p className="text-black/40 text-xs tracking-wider">Fill in the details and upload images to list a piece.</p>
              </div>

              {/* ── Image Upload ── */}
              <div className="space-y-4">
                <p className="text-[10px] text-[#A8751E] tracking-[0.3em]">
                  IMAGES <span className="text-red-400">*</span>
                  <span className="text-black/30 ml-2 tracking-normal normal-case">(max 10, first image = main)</span>
                </p>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-[#A8751E] bg-[#A8751E]/5'
                      : 'border-black/12 hover:border-black/25 hover:bg-black/2'
                  }`}
                >
                  <input {...getInputProps()} />
                  <ImageIcon size={28} className="text-black/25 mx-auto mb-4" />
                  <p className="text-black/60 text-sm mb-1">
                    {isDragActive ? 'Drop images here…' : 'Drag & drop images here'}
                  </p>
                  <p className="text-black/30 text-xs">or click to browse · JPG, PNG, WebP · Max 10MB each</p>
                </div>

                {/* Image previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2.5">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(img)}
                          alt=""
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreview(URL.createObjectURL(img))}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={10} className="text-white" />
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#A8751E] text-white text-[8px] text-center py-0.5 tracking-wider font-medium">
                            MAIN
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Add more slot */}
                    {images.length < 10 && (
                      <div
                        {...getRootProps()}
                        className="aspect-square border border-dashed border-black/15 flex items-center justify-center cursor-pointer hover:border-[#A8751E]/50 hover:bg-[#A8751E]/3 transition-all"
                      >
                        <input {...getInputProps()} />
                        <Plus size={18} className="text-black/30" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Form fields ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <Field
                  label="Jewellery Name" name="name" required
                  placeholder="e.g. Royal Diamond Necklace"
                  value={form.name} onChange={handleChange}
                />

                <div>
                  <label className="block text-[10px] text-[#A8751E] tracking-[0.3em] mb-2">
                    CATEGORY <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-black focus:outline-none focus:border-[#A8751E]/60 transition-colors"
                  >
                    <option value="">Select category…</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <Field
                  label="Price (₹)" name="price" type="number" required
                  placeholder="e.g. 25000"
                  value={form.price} onChange={handleChange}
                />

                <div>
                  <label className="block text-[10px] text-[#A8751E] tracking-[0.3em] mb-2">MATERIAL</label>
                  <select
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-black focus:outline-none focus:border-[#A8751E]/60 transition-colors"
                  >
                    <option value="">Select material…</option>
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <Field
                  label="Quantity in Stock" name="quantity" type="number"
                  placeholder="e.g. 5"
                  value={form.quantity} onChange={handleChange}
                />

                <Field
                  label="Weight" name="weight"
                  placeholder="e.g. 12g"
                  value={form.weight} onChange={handleChange}
                />

                <Field
                  label="Dimensions" name="dimensions"
                  placeholder="e.g. 45cm chain"
                  value={form.dimensions} onChange={handleChange}
                />
              </div>

              <Field
                label="Description" name="description" as="textarea"
                placeholder="Describe this jewellery piece — material quality, design inspiration, care instructions…"
                value={form.description} onChange={handleChange}
              />

              {/* Submit row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-black/5">
                <button
                  type="submit"
                  disabled={uploading}
                  className="relative sm:min-w-[200px] inline-flex items-center justify-center gap-2 px-10 py-4
                             border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                             overflow-hidden hover:text-white group transition-colors duration-500
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 disabled:hidden" />
                  <span className="relative z-10 flex items-center gap-2">
                    {uploading
                      ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                      : <><Upload size={14} /> Add Jewellery</>}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(EMPTY_FORM); setImages([]); }}
                  className="text-xs text-black/35 hover:text-black tracking-widest transition-colors py-2 sm:py-0"
                >
                  CLEAR FORM
                </button>
              </div>
            </motion.form>
          )}

          {/* ══ MANAGE TAB ══ */}
          {tab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
                <div>
                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-black mb-1">Manage Inventory</h2>
                  <p className="text-black/40 text-xs tracking-wider">
                    {jewels.length} {jewels.length === 1 ? 'piece' : 'pieces'} listed
                  </p>
                </div>
                <button
                  onClick={fetchJewels}
                  disabled={loadingJewels}
                  className="text-[10px] tracking-widest text-black/40 hover:text-[#A8751E] border border-black/8 hover:border-[#A8751E]/40 px-4 py-2.5 transition-all flex items-center gap-2"
                >
                  {loadingJewels ? <Loader2 size={12} className="animate-spin" /> : null}
                  REFRESH
                </button>
              </div>

              {loadingJewels ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-black/4 animate-pulse" />
                  ))}
                </div>
              ) : jewels.length === 0 ? (
                <div className="text-center py-20 sm:py-28 border border-black/6">
                  <p className="text-4xl sm:text-5xl mb-5">💍</p>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-black italic mb-3">No Jewellery Yet</h3>
                  <p className="text-black/40 text-xs tracking-widest mb-7">
                    Upload your first piece to get started
                  </p>
                  <button onClick={() => setTab('upload')}
                    className="relative inline-flex items-center justify-center gap-2 px-10 py-4
                               border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                               overflow-hidden hover:text-white group transition-colors duration-500">
                    <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-2"><Plus size={14} /> Add Jewellery</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {jewels.map(j => (
                      <motion.div
                        key={j.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 sm:gap-4 border border-black/6 p-3 sm:p-4 hover:border-black/12 transition-colors group bg-white"
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#f5f5f5] overflow-hidden cursor-pointer"
                          onClick={() => j.images?.[0] && setPreview(j.images[0])}
                        >
                          <img
                            src={j.images?.[0] || 'https://placehold.co/64x64/f5f5f5/C9A84C?text=✦'}
                            alt={j.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-black text-sm font-medium truncate">{j.name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            {j.category && (
                              <span className="text-[9px] text-[#A8751E] tracking-wider">{j.category}</span>
                            )}
                            <span className="text-black/60 text-xs">
                              ₹{Number(j.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-black/30 text-[9px]">
                              {j.images?.length || 0} photo{j.images?.length !== 1 ? 's' : ''}
                            </span>
                            <span className={`text-[9px] tracking-wider ${Number(j.quantity) > 0 ? 'text-green-600' : 'text-red-400'}`}>
                              {Number(j.quantity) > 0 ? `${j.quantity} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={`/jewelry/${j.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-black/30 hover:text-[#A8751E] transition-colors"
                            title="Preview"
                          >
                            <Eye size={15} />
                          </a>
                          <button
                            onClick={() => handleDelete(j)}
                            disabled={deleting === j.id}
                            className="p-2 text-black/30 hover:text-red-500 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            {deleting === j.id
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Trash2 size={15} />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Image Preview Modal ── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={preview}
              alt=""
              className="max-h-[85vh] max-w-full object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-5 right-5 text-white/70 hover:text-white p-2 transition-colors"
            >
              <X size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}