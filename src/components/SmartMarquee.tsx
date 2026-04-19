import { useRef, useEffect, useState } from 'react';

export default function SmartMarquee({ text, className = '', isActive = false }: { text: string; className?: string; isActive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    
    // Check after a slight delay to ensure fonts/layout are loaded
    const timeout = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  const marqueeStyle = {
    display: 'inline-block',
    animation: 'marqueeScroll 8s linear infinite',
    paddingLeft: '2rem'
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden whitespace-nowrap w-full flex items-center ${isOverflowing ? 'scroll-marquee-container' : ''} ${className} ${isActive ? 'font-medium' : 'text-system-text/80'}`}
      dir="auto"
    >
      {isOverflowing ? (
        <div className="flex w-fit hover:[animation-play-state:paused] scroll-marquee">
          <span className="pe-12 min-w-max">{text}</span>
          <span className="pe-12 min-w-max">{text}</span>
          <span className="pe-12 min-w-max" aria-hidden="true">{text}</span>
        </div>
      ) : (
        <span ref={textRef} className="truncate w-full block">{text}</span>
      )}
    </div>
  );
}
