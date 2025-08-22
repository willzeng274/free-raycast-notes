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
    <div className="absolute inset-0 pt-10 pb-10 px-10">
      <div
        className="relative mx-auto w-full max-w-[44rem] bg-[#F6F6F6] dark:bg-[#2A2A2A] rounded-2xl shadow-xl shadow-black/15 dark:shadow-black/40 overflow-hidden"
        onClick={handlePanelClick}
      >
        {children}
      </div>
    </div>
  );
}
