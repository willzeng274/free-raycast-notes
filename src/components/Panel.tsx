import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function Panel({ children }: PanelProps) {
  const handlePanelClick = (e: React.MouseEvent) => {
    // Prevent clicks inside the panel from bubbling up and closing it
    e.stopPropagation();
  };

  return (
    <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 pb-10 px-10 z-50">
      <div
        className="relative w-full max-w-[44rem] max-h-[500px] bg-white/95 dark:bg-[#2A2A2A]/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/15 dark:shadow-black/40 overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
        onClick={handlePanelClick}
      >
        {children}
      </div>
    </div>
  );
}
