'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { GlossaryEntry } from '@/lib/glossary';

const PANEL_WIDTH = 288; // w-72 in px

interface Props {
  content: GlossaryEntry | { label: string; plain: string; calc?: string; interpret: string };
  children: React.ReactNode;
  /** Show a small ⓘ badge next to children — useful for unlabelled inline stats */
  showHint?: boolean;
}

export function Tooltip({ content, children, showHint = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // SSR guard — document.body is not available during server render
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    const rawX = e.clientX + 12;
    const x =
      rawX + PANEL_WIDTH > window.innerWidth ? e.clientX - PANEL_WIDTH - 12 : rawX;
    // Flip above cursor if close to bottom of viewport
    const PANEL_HEIGHT_EST = 140;
    const y =
      e.clientY + 16 + PANEL_HEIGHT_EST > window.innerHeight
        ? e.clientY - PANEL_HEIGHT_EST - 8
        : e.clientY + 16;
    setCoords({ x, y });
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpen(false);
  }, []);

  const panel =
    open ? (
      <div
        className="fixed z-50 pointer-events-none w-72 bg-[#111114] border border-white/[0.10] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] p-3.5 text-left"
        style={{ top: coords.y, left: coords.x }}
        role="tooltip"
      >
        {content.label && (
          <div className="text-[11px] font-semibold text-[#ececf0] mb-1 tracking-wide">
            {content.label}
          </div>
        )}
        <div className="text-xs text-[#a1a1aa] leading-relaxed">{content.plain}</div>
        {content.calc && (
          <>
            <div className="border-t border-white/[0.06] my-2" />
            <div className="text-[11px] text-[#6b6b78] font-mono leading-relaxed">
              {content.calc}
            </div>
          </>
        )}
        {content.interpret && (
          <div className="text-[11px] text-[#44444f] mt-1.5 italic leading-relaxed">
            {content.interpret}
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      {/* span (not div) so it's valid inside <th> phrasing content */}
      <span
        className="inline-flex items-center gap-1 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {showHint && (
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-white/[0.12] text-[9px] text-[#6b6b78] leading-none flex-shrink-0"
            aria-hidden="true"
          >
            ?
          </span>
        )}
      </span>
      {mounted && ReactDOM.createPortal(panel, document.body)}
    </>
  );
}
