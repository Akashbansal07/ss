import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

export default function JewelCard({ jewel, index = 0 }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: -y * 14, y: x * 14 });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setHovered(false);
  };

  const img = jewel.images?.[0] || 'https://placehold.co/400x500/111/C9A84C?text=✦';
  const price = Number(jewel.price).toLocaleString('en-IN');

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/jewelry/${jewel.id}`}>
        <div
          ref={cardRef}
          className="card-3d group cursor-pointer"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onMouseEnter={() => setHovered(true)}
          style={{
            transform: `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: hovered ? 'transform 0.08s ease' : 'transform 0.5s ease',
            boxShadow: hovered
              ? '0 30px 80px rgba(201,168,76,0.2), 0 0 0 1px rgba(201,168,76,0.15)'
              : '0 4px 30px rgba(0,0,0,0.6)',
          }}
        >
          {/* Image */}
          <div className="img-zoom relative aspect-[3/4] bg-card overflow-hidden">
            <img
              src={img}
              alt={jewel.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Category badge */}
            {jewel.category && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm">
                <span className="text-[8px] text-gold tracking-widest">{jewel.category.toUpperCase()}</span>
              </div>
            )}

            {/* Hover overlay */}
            <motion.div
              initial={false}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 text-white text-[11px] tracking-widest border border-white/40 px-5 py-3">
                <Eye size={13} />
                VIEW PIECE
              </div>
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-4 bg-card border border-white/5 border-t-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg text-white leading-tight group-hover:text-gold transition-colors duration-300">
                {jewel.name}
              </h3>
              <p className="text-gold text-sm font-medium whitespace-nowrap">₹{price}</p>
            </div>
            {jewel.material && (
              <p className="text-gray-600 text-[10px] tracking-widest mt-1">{jewel.material.toUpperCase()}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
