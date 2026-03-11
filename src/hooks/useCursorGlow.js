import { useEffect } from 'react';

const SPOTLIGHT_RADIUS = 350;
const PROXIMITY = SPOTLIGHT_RADIUS * 0.5;
const FADE_DISTANCE = SPOTLIGHT_RADIUS * 0.75;

const CARD_SELECTOR = '.input-card, .pain-gauge, .score-breakdown';

export default function useCursorGlow(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'cursor-spotlight';
    document.body.appendChild(spotlight);

    let rafId = null;

    const onMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cards = container.querySelectorAll(CARD_SELECTOR);
        let minDist = Infinity;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const rx = ((e.clientX - rect.left) / rect.width) * 100;
          const ry = ((e.clientY - rect.top) / rect.height) * 100;

          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.max(
            0,
            Math.hypot(e.clientX - cx, e.clientY - cy) -
              Math.max(rect.width, rect.height) / 2
          );
          minDist = Math.min(minDist, dist);

          let intensity = 0;
          if (dist <= PROXIMITY) {
            intensity = 1;
          } else if (dist <= FADE_DISTANCE) {
            intensity = (FADE_DISTANCE - dist) / (FADE_DISTANCE - PROXIMITY);
          }

          card.style.setProperty('--glow-x', `${rx}%`);
          card.style.setProperty('--glow-y', `${ry}%`);
          card.style.setProperty('--glow-intensity', intensity.toString());
        });

        spotlight.style.left = `${e.clientX}px`;
        spotlight.style.top = `${e.clientY}px`;

        const opacity =
          minDist <= PROXIMITY
            ? 0.7
            : minDist <= FADE_DISTANCE
              ? ((FADE_DISTANCE - minDist) / (FADE_DISTANCE - PROXIMITY)) * 0.7
              : 0;
        spotlight.style.opacity = opacity;
      });
    };

    const onLeave = () => {
      container.querySelectorAll(CARD_SELECTOR).forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });
      spotlight.style.opacity = '0';
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      spotlight.remove();
    };
  }, [containerRef]);
}
