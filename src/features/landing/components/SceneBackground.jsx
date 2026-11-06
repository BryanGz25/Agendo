import { useEffect, useRef, useState } from 'react';

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Fixed 3D background. Three.js loads on demand so the first paint of the
 * page does not wait for it; without WebGL the page keeps a static gradient.
 * Scroll progress comes from the whole document height.
 */
export default function SceneBackground() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!webglAvailable()) return undefined;
    let scene;
    let cancelled = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scene?.setProgress(max > 0 ? window.scrollY / max : 0);
    };

    import('../three/BarberScene').then(({ BarberScene }) => {
      if (cancelled || !canvasRef.current) return;
      scene = new BarberScene(canvasRef.current, { reducedMotion });
      onScroll();
      setReady(true);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelled = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      scene?.dispose();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-night">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,#3b2a1a_0%,#0c0a08_60%)]" />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Keeps text readable over the scene, stronger on phones. */}
      <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/40 to-transparent max-md:from-night/70 max-md:via-night/55 max-md:to-night/40" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
    </div>
  );
}
