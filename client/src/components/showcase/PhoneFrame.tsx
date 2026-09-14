import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
  preview?: boolean;
}

export function PhoneFrame({ children, className = '', preview = true }: PhoneFrameProps) {
  return (
    <div className={`relative mx-auto w-[min(100%,390px)] max-w-full ${className}`}>
      <div className="relative overflow-hidden rounded-[2.75rem] border-[10px] border-[#2c2420] bg-[#1a1512] p-1.5 shadow-[0_35px_90px_rgba(44,36,32,0.33)]">
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1a1512]" />
        <div
          className={`h-[min(72vh,820px)] w-full overflow-x-hidden overflow-y-auto rounded-[2rem] bg-white ${preview ? 'overscroll-contain touch-pan-y scrollbar-hidden' : 'overflow-hidden'}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="min-h-full w-full min-w-0 overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
