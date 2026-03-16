import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useUserStore } from '../../store/useUserStore';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const { theme } = useUserStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const trueRef = useRef<HTMLSpanElement>(null);
  const sayRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Final fade out of the entire container
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: onComplete
        });
      }
    });

    // Reset initial states
    gsap.set([trueRef.current, sayRef.current], { y: 50, opacity: 0 });
    gsap.set(lightRef.current, { scale: 0, opacity: 0 });
    gsap.set(progressRef.current, { width: 0 });

    // Animation Sequence
    tl.to(lightRef.current, {
      scale: 1,
      opacity: 0.1,
      duration: 1,
      ease: 'back.out(1.7)'
    })
    .to(trueRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power4.out'
    }, "-=0.5")
    .to(sayRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power4.out'
    }, "-=0.6")
    .to(progressRef.current, {
      width: '100%',
      duration: 2.5,
      ease: 'power1.inOut',
    }, 0)
    .to(textRef.current, {
      letterSpacing: "0.2em",
      duration: 1.5,
      ease: "power2.inOut"
    }, "-=0.4")
    .to(lightRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 1,
      ease: "power2.in"
    }, "-=1");

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gray-950' : 'bg-white'
      }`}
    >
      {/* Dynamic Glow Background */}
      <div
        ref={lightRef}
        className={`absolute w-64 h-64 rounded-full blur-[100px] ${
          theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-500/20'
        }`}
      />

      <div ref={textRef} className="relative z-10 flex items-center justify-center">
        <div className="bg-gray-950 px-6 py-2.5 rounded-full shadow-2xl border border-white/5 flex items-center gap-0">
          <span
            ref={trueRef}
            className="inline-block text-4xl sm:text-6xl font-black tracking-tighter text-white"
          >
            True
          </span>
          <span
            ref={sayRef}
            className="inline-block text-4xl sm:text-6xl font-black tracking-tighter text-blue-500"
          >
            Say
          </span>
        </div>
      </div>

      {/* Charging Progress Bar */}
      <div className="absolute bottom-10 left-10 right-10 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden max-w-sm mx-auto">
        <div 
          ref={progressRef}
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <div className="mt-2 text-center">
           <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Charging System</span>
        </div>
      </div>
    </div>
  );
}
