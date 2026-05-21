import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

export default function JewelCard({ jewel, index = 0 }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x:0, y:0 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    setRotate({ x: -((e.clientY-r.top)/r.height-.5)*12, y: ((e.clientX-r.left)/r.width-.5)*12 });
  };

  const img   = jewel.images?.[0] || 'https://placehold.co/400x500/111/C9A84C?text=✦';
  const price = Number(jewel.price).toLocaleString('en-IN');
  const inStock = Number(jewel.quantity) > 0;

  return (
    <motion.div
      initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-40px' }}
      transition={{ duration:0.6, delay:index*0.08 }}>
      <Link to={`/jewelry/${jewel.id}`}>
        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={() => { setRotate({x:0,y:0}); setHovered(false); }}
          onMouseEnter={() => setHovered(true)}
          style={{
            transform: `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: hovered ? 'transform .08s' : 'transform .5s ease',
            boxShadow: hovered ? '0 24px 60px rgba(201,168,76,.15), 0 0 0 1px rgba(201,168,76,.1)' : '0 4px 20px rgba(0,0,0,.5)',
          }}
          className="cursor-pointer group"
        >
          {/* image */}
          <div className="relative aspect-[3/4] bg-[#111] overflow-hidden">
            <img src={img} alt={jewel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" loading="lazy" />

            {jewel.category && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm">
                <span className="text-[8px] text-[#C9A84C] tracking-[.2em] font-medium">{jewel.category.toUpperCase()}</span>
              </div>
            )}

            <motion.div animate={{ opacity: hovered?1:0 }} transition={{ duration:.25 }}
              className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white text-[10px] tracking-[.2em] border border-white/50 px-5 py-3">
                <Eye size={13} /> VIEW PIECE
              </div>
            </motion.div>
          </div>

          {/* info */}
          <div className="p-5 bg-[#111] border border-white/5 border-t-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-['Cormorant_Garamond',serif] text-lg text-white leading-snug group-hover:text-[#C9A84C] transition-colors duration-300 flex-1 min-w-0">
                {jewel.name}
              </h3>
              <p className="text-[#C9A84C] text-sm font-semibold whitespace-nowrap flex-shrink-0">₹{price}</p>
            </div>
            {jewel.material && (
              <p className="text-gray-500 text-[10px] tracking-[.2em] mt-1.5">{jewel.material.toUpperCase()}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${inStock?'bg-green-500':'bg-red-500'}`} />
              <span className={`text-[9px] tracking-[.2em] ${inStock?'text-green-400':'text-red-400'}`}>
                {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}