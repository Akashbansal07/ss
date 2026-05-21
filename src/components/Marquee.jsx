export default function Marquee({ reverse = false }) {
  const items = ['RINGS', 'NECKLACES', 'EARRINGS', 'BRACELETS', 'PENDANTS', 'BANGLES', 'ANKLETS', 'SETS'];
  const text = items.map(i => `${i}  •  `).join('').repeat(4);

  return (
    <div className="py-5 border-y border-white/5 overflow-hidden bg-dark">
      <div
        className="marquee-track inline-block"
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        <span className="text-[11px] tracking-[0.4em] text-gold/60 font-display text-xl italic">
          {text}
        </span>
        <span className="text-[11px] tracking-[0.4em] text-gold/60 font-display text-xl italic">
          {text}
        </span>
      </div>
    </div>
  );
}
