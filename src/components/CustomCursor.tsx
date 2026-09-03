import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text' | 'zoom' | 'drag'>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on devices with fine pointer (not touch)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const onMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest('button, a, input, textarea, select, [role="button"], [data-cursor]');
      
      if (interactiveEl) {
        const customCursor = interactiveEl.getAttribute('data-cursor');
        const customLabel = interactiveEl.getAttribute('data-cursor-label');
        if (customCursor) {
          setCursorType(customCursor as any);
        } else {
          setCursorType('pointer');
        }
        setCursorLabel(customLabel || '');
      } else {
        setCursorType('default');
        setCursorLabel('');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isPointer = cursorType === 'pointer';

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-start select-none"
      animate={{
        x: mousePos.x,
        y: mousePos.y,
        scale: isPointer ? 1.15 : 1
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 600, mass: 0.08 }}
    >
      {/* Sleek Custom Editorial Arrow Cursor */}
      <div className="relative -top-0.5 -left-0.5">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_4px_rgba(58, 43, 39,0.35)]"
        >
          {/* Arrow Body: Dark Terracotta with sharp Charcoal stroke */}
          <path
            d="M3 2L9.5 21.5L13 13L21.5 9.5L3 2Z"
            fill={isPointer ? '#5C1D24' : '#3A2B27'}
            stroke="#FFF5E9"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner Accent Core */}
          <path
            d="M4.5 4.5L9.2 18L11.8 11.8L18 9.2L4.5 4.5Z"
            fill={isPointer ? '#8A8E3E' : '#5C1D24'}
          />
        </svg>

        {/* Optional Context Label when hovering interactive targets with label */}
        {cursorLabel && (
          <div className="absolute left-6 top-3 px-2 py-0.5 bg-[#3A2B27] text-[#FFF5E9] border border-[#FFF5E9]/30 text-[9px] font-mono uppercase tracking-widest rounded-xs shadow-md whitespace-nowrap">
            {cursorLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
};
