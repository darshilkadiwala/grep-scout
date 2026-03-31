import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for tooltip management, ensures tooltips stay within viewport.
 */
export function useTooltipPositioning() {
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const showTooltip = useCallback((e: React.MouseEvent, text: string) => {
    const btn = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = btn.left + btn.width / 2;
    const y = btn.bottom + 6;

    // Use a very conservative boundary check to prevent shifting unless absolutely necessary
    // This resolves the mismatch where tooltips were being pushed too far from their origin elements.
    const margin = 12;
    const assumedHalfWidth = 60; // Safer average half-width

    if (x + assumedHalfWidth > window.innerWidth - margin) {
      x = window.innerWidth - assumedHalfWidth - margin;
    }
    if (x - assumedHalfWidth < margin) {
      x = assumedHalfWidth + margin;
    }

    setActiveTooltip({ text, x, y });
  }, []);

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', hideTooltip, true);
    return () => window.removeEventListener('scroll', hideTooltip, true);
  }, [hideTooltip]);

  return { activeTooltip, showTooltip, hideTooltip };
}
