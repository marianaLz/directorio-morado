import { useEffect, useState } from "react";
import ButtonSolid from "../ui/ButtonSolid";

const SCROLL_THRESHOLD_PX = 500;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY >= SCROLL_THRESHOLD_PX);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <ButtonSolid
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 text-sm"
      aria-label="Volver arriba"
    >
      <span aria-hidden className="text-lg leading-none">
        ↑
      </span>
      <span>Volver arriba</span>
    </ButtonSolid>
  );
}
