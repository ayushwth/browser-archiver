import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to targetValue over the given duration.
 * Uses requestAnimationFrame with easeOutExpo for a smooth count-up.
 */
export function useAnimatedCounter(targetValue, duration = 1200, delay = 0) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (targetValue == null || targetValue === 0) {
      setCurrent(0);
      return;
    }

    const timeout = setTimeout(() => {
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCurrent(Math.round(eased * targetValue));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration, delay]);

  return current;
}
