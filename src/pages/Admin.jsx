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
  Image as ImageIcon, Loader2
} from 'lucide-react';

const CATS = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Bangles', 'Anklets', 'Sets'];
const MATERIALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'Diamond', 'Pearl', 'Mixed', 'Other'];

const EMPTY_FORM = {
  name: '', category: '', price: '', description: '',
  quantity: '', material: '', weight: '', dimensions: '',
};

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ss_admin') === 'true');
  const [pwd, setPwd] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [jewels, setJewels] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [tab, setTab] = useState('upload');
  const [preview, setPreview] = useState(null);

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
  });

  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const fetchJewels = async () => {
    try {
      const q = query(collection(db, 'jewelry'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setJewels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error('Failed to load jewellery');
    }
  };

  useEffect(() => {
    if (authed) fetchJewels();
  }, [authed]);

  const login = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Jewellery name is required');
    if (!form.price || isNaN(Number(form.price))) return toast.error('Valid price is required');
    if (images.length === 0) return toast.error('At least one image is required');
    if (images.length > 10) return toast.error('Maximum 10 images allowed');

    setUploading(true);
    const t = toast.loading('Uploading jewellery...');

    try {
      const jewelId = crypto.randomUUID();
      const urls = [];

      for (let i = 0; i < images.length; i++) {
        toast.loading(`Uploading image ${i + 1} of ${images.length}...`, { id: t });
        const imgRef = ref(storage, `jewelry/${jewelId}/image_${i}`);
        await uploadBytes(imgRef, images[i]);
        const url = await getDownloadURL(imgRef);
        urls.push(url);
      }

      toast.loading('Saving to database...', { id: t });

      await addDoc(collection(db, 'jewelry'), {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity) || 0,
        images: urls,
        jewelId,
        createdAt: serverTimestamp(),
      });

      toast.success('Jewellery added successfully!', { id: t });
      setForm(EMPTY_FORM);
      setImages([]);
      fetchJewels();
      setTab('manage');
    } catch (err) {
      toast.error('Upload failed. Please check Firebase config.', { id: t });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (jewel) => {
    if (!confirm(`Delete "${jewel.name}"? This cannot be undone.`)) return;
    setDeleting(jewel.id);
    const t = toast.loading('Deleting...');
    try {
      if (jewel.jewelId && jewel.images?.length) {
        for (let i = 0; i < jewel.images.length; i++) {
          try {
            const imgRef = ref(storage, `jewelry/${jewel.jewelId}/image_${i}`);
            await deleteObject(imgRef);
          } catch {}
        }
      }
      await deleteDoc(doc(db, 'jewelry', jewel.id));
      toast.success('Deleted successfully', { id: t });
      setJewels(prev => prev.filter(j => j.id !== jewel.id));
    } catch (err) {
      toast.error('Failed to delete', { id: t });
    } finally {
      setDeleting(null);
    }
  };

  const Field = ({ label, name, type = 'text', required, placeholder, as }) => (
    <div>
      <label className="block text-[10px] text-gold tracking-[0.3em] mb-2">
        {label.toUpperCase()}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-transparent border border-white/10 p-3 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gold/50 resize-none transition-colors"
        />
      ) : as === 'select' ? null : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-transparent border border-white/10 p-3 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-gold/50 transition-colors"
        />
      )}
    </div>
  );

  // ── LOGIN SCREEN ─────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12">
            <div className="w-14 h-14 border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <Lock size={22} className="text-gold" />
            </div>
            <p className="text-gold text-[10px] tracking-[0.5em] mb-3">OWNER ACCESS</p>
            <h1 className="font-display text-4xl text-white">Admin Panel</h1>
            <p className="text-gray-600 text-xs mt-2">Shri Swastik Jewellery Management</p>
          </div>

          <div className="border border-white/8 p-8 bg-[#080808]">
            <div className="mb-6">
              <label className="block text-[10px] text-gold tracking-[0.4em] mb-3">PASSWORD</label>
              <input
                type="password"
                value={pwd}
                onChange={e => { setPwd(e.target.value); setPwdErr(''); }}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Enter admin password"
                autoFocus
                className="w-full bg-transparent border border-white/10 p-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-gold/50 transition-colors tracking-widest"
              />
              {pwdErr && (
                <p className="text-red-400 text-[10px] mt-2 tracking-wider">{pwdErr}</p>
              )}
            </div>

            <button
              onClick={login}
              className="btn-gold w-full"
            >
              <span>Enter Admin Panel</span>
            </button>
          </div>

          <p className="text-center text-gray-700 text-[10px] mt-8 tracking-widest">
            SHRI SWASTIK © 2024 — AUTHORIZED ACCESS ONLY
          </p>
        </motion.div>
      </div>
    );
  }

  // ── DASHBOARD ────────────────────────────────────
  return (
    <div className="min-h-screen bg-black">
      {/* Admin Navbar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-display text-xl text-white tracking-widest">SHRI SWASTIK</p>
            <p className="text-gold/50 text-[8px] tracking-[0.5em]">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-[10px] tracking-widest hidden sm:block">{jewels.length} PIECES</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-xs tracking-widest"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">LOGOUT</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-6 mb-10 border-b border-white/5 pb-4">
          {[['upload', 'Add Jewellery', Plus], ['manage', 'Manage Collection', ImageIcon]].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 text-xs tracking-widest pb-4 -mb-4 border-b-2 transition-colors ${
                tab === key ? 'text-gold border-gold' : 'text-gray-600 border-transparent hover:text-gray-400'
              }`}
            >
              <Icon size={14} />
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── UPLOAD TAB ── */}
        <AnimatePresence mode="wait">
          {tab === 'upload' && (
            <motion.form
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Image Upload */}
              <div>
                <label className="block text-[10px] text-gold tracking-[0.4em] mb-4">
                  PHOTOS <span className="text-red-500">*</span>
                  <span className="text-gray-600 ml-2 normal-case tracking-normal">(min 1, max 10)</span>
                </label>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive ? 'dropzone-active' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={28} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-1">
                    {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
                  </p>
                  <p className="text-gray-700 text-[10px] tracking-widest">OR CLICK TO BROWSE</p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gold text-black text-[8px] text-center py-0.5 tracking-wider">
                            MAIN
                          </div>
                        )}
                      </div>
                    ))}
                    {images.length < 10 && (
                      <div
                        {...getRootProps()}
                        className="aspect-square border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-gold/40 transition-colors"
                      >
                        <input {...getInputProps()} />
                        <Plus size={16} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Jewellery Name" name="name" required placeholder="e.g. Royal Diamond Necklace" />

                <div>
                  <label className="block text-[10px] text-gold tracking-[0.3em] mb-2">
                    CATEGORY <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 p-3 text-xs text-gray-300 focus:outline-none focus:border-gold/50 transition-colors"
                  >
                    <option value="">Select category</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <Field label="Price (₹)" name="price" type="number" required placeholder="e.g. 25000" />

                <div>
                  <label className="block text-[10px] text-gold tracking-[0.3em] mb-2">MATERIAL</label>
                  <select
                    value={form.material}
                    onChange={e => setForm(p => ({ ...p, material: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 p-3 text-xs text-gray-300 focus:outline-none focus:border-gold/50 transition-colors"
                  >
                    <option value="">Select material</option>
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <Field label="Quantity in Stock" name="quantity" type="number" placeholder="e.g. 5" />
                <Field label="Weight" name="weight" placeholder="e.g. 12g" />
                <Field label="Dimensions" name="dimensions" placeholder="e.g. 45cm chain" />
              </div>

              <Field label="Description" name="description" as="textarea" placeholder="Describe this jewellery piece — material quality, design inspiration, care instructions..." />

              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-gold flex-1 md:flex-none md:min-w-[200px]"
                >
                  <span>
                    {uploading
                      ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                      : <><Upload size={14} /> Add Jewellery</>}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(EMPTY_FORM); setImages([]); }}
                  className="text-xs text-gray-600 hover:text-gray-400 tracking-widest transition-colors"
                >
                  CLEAR FORM
                </button>
              </div>
            </motion.form>
          )}

          {/* ── MANAGE TAB ── */}
          {tab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {jewels.length === 0 ? (
                <div className="text-center py-24 border border-white/5">
                  <p className="text-5xl mb-4">💍</p>
                  <h3 className="font-display text-2xl text-white italic mb-3">No Jewellery Yet</h3>
                  <p className="text-gray-600 text-xs tracking-widest mb-6">Upload your first piece to get started</p>
                  <button onClick={() => setTab('upload')} className="btn-gold">
                    <span><Plus size={14} /> Add Jewellery</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jewels.map(j => (
                    <motion.div
                      key={j.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="flex items-center gap-4 border border-white/5 p-4 hover:border-white/10 transition-colors group"
                    >
                      {/* Thumb */}
                      <div className="w-16 h-16 shrink-0 bg-card overflow-hidden">
                        <img
                          src={j.images?.[0] || 'https://placehold.co/64x64/111/C9A84C?text=✦'}
                          alt={j.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{j.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {j.category && <span className="text-[9px] text-gold tracking-widest">{j.category}</span>}
                          <span className="text-gray-500 text-xs">₹{Number(j.price).toLocaleString('en-IN')}</span>
                          <span className="text-gray-600 text-[9px]">{j.images?.length || 0} photo{j.images?.length !== 1 ? 's' : ''}</span>
                          <span className={`text-[9px] tracking-wider ${Number(j.quantity) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Number(j.quantity) > 0 ? `${j.quantity} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/jewelry/${j.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-gold transition-colors"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => handleDelete(j)}
                          disabled={deleting === j.id}
                          className="p-2 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deleting === j.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          >
            <img src={preview} alt="" className="max-h-[80vh] max-w-full object-contain" />
            <button onClick={() => setPreview(null)} className="absolute top-6 right-6 text-white">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
