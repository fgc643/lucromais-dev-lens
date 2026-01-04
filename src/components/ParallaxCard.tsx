import { useRef, useCallback, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  style?: React.CSSProperties;
}

export const ParallaxCard = ({ children, className, intensity = 6, style }: ParallaxCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const lastUpdate = useRef<number>(0);
  const rafId = useRef<number>();
  const pendingUpdate = useRef<{ x: number; y: number } | null>(null);
  
  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Throttled update using RAF
  const updateTransform = useCallback(() => {
    if (!pendingUpdate.current || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const { x, y } = pendingUpdate.current;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Reduced intensity for smoother effect
    const rotateX = ((y - centerY) / centerY) * -intensity * 0.5;
    const rotateY = ((x - centerX) / centerX) * intensity * 0.5;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`);
    pendingUpdate.current = null;
  }, [intensity]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (!ref.current) return;
    
    const now = Date.now();
    // Throttle to 60fps max (16ms between updates)
    if (now - lastUpdate.current < 16) {
      return;
    }
    lastUpdate.current = now;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    pendingUpdate.current = { x, y };
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(updateTransform);
  }, [updateTransform, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    pendingUpdate.current = null;
    setTransform('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <Card
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "transition-transform duration-300 ease-out",
        className
      )}
      style={{ 
        ...style, 
        transform: transform || style?.transform,
        willChange: transform ? 'transform' : 'auto'
      }}
    >
      {children}
    </Card>
  );
};
