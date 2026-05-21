export default function Marquee({ reverse = false }) {
  const items = ['RINGS', 'NECKLACES', 'EARRINGS', 'BRACELETS', 'PENDANTS', 'BANGLES', 'ANKLETS', 'SETS'];
  const text  = items.map(i => `${i}  ✦  `).join('').repeat(4);

  return (
    <div className="py-4 border-y border-white/5 overflow-hidden bg-[#060606]">
      <div className="marquee-track inline-block"
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}>
        <span className="font-display italic text-lg tracking-[0.35em] text-gold/25">{text}</span>
        <span className="font-display italic text-lg tracking-[0.35em] text-gold/25">{text}</span>
      </div>
    </div>
  );
}