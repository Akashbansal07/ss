import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6"
    >
      <p className="font-['Cormorant_Garamond',serif] text-[120px] md:text-[180px] text-black/5 leading-none select-none">404</p>
      <div className="-mt-8">
        <p className="text-[#A8751E] text-[10px] tracking-[0.5em] mb-4">PAGE NOT FOUND</p>
        <h1 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl text-black italic mb-4">Lost in the Vault</h1>
        <p className="text-black/40 text-sm mb-10 max-w-xs mx-auto">
          The page you are looking for has been moved or does not exist.
        </p>
        <Link to="/">
          <button className="relative inline-flex items-center gap-2 px-10 py-4
                             border border-[#A8751E] text-[#A8751E] text-[11px] tracking-[.25em] uppercase
                             overflow-hidden hover:text-white group transition-colors duration-500">
            <span className="absolute inset-0 bg-[#A8751E] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <span className="relative z-10 flex items-center gap-2"><ArrowLeft size={13} /> Back to Home</span>
          </button>
        </Link>
      </div>
    </motion.div>
  );
}