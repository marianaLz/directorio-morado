import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD_PX = 500;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY >= SCROLL_THRESHOLD_PX);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[var(--brand-purple-accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[var(--brand-purple-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2"
      aria-label="Volver arriba"
    >
      <span aria-hidden className="text-lg leading-none">↑</span>
      <span>Volver arriba</span>
    </button>
  );
}
