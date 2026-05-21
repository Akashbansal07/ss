import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6"
    >
      <p className="font-display text-[120px] md:text-[180px] text-white/5 leading-none select-none">404</p>
      <div className="-mt-8">
        <p className="text-gold text-[10px] tracking-[0.5em] mb-4">PAGE NOT FOUND</p>
        <h1 className="font-display text-4xl md:text-5xl text-white italic mb-4">Lost in the Vault</h1>
        <p className="text-gray-500 text-sm mb-10 max-w-xs mx-auto">
          The page you are looking for has been moved or does not exist.
        </p>
        <Link to="/">
          <button className="btn-gold">
            <span><ArrowLeft size={13} /> Back to Home</span>
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
