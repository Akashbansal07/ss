export default function Marquee({ reverse = false }) {
  const items = ['RINGS', 'NECKLACES', 'EARRINGS', 'BRACELETS', 'PENDANTS', 'BANGLES', 'ANKLETS', 'SETS'];
  const text  = items.map(i => `${i}  ✦  `).join('').repeat(4);

  return (
    <div className="py-4 border-y border-black/5 overflow-hidden bg-[#fafafa]">
      <div className="marquee-track inline-block"
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}>
        <span className="font-['Cormorant_Garamond',serif] italic text-lg tracking-[0.35em] text-[#A8751E]/25">{text}</span>
        <span className="font-['Cormorant_Garamond',serif] italic text-lg tracking-[0.35em] text-[#A8751E]/25">{text}</span>
      </div>
    </div>
  );
}