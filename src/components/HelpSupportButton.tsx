import React, { useState } from 'react';
import { HelpSupportModal } from './HelpSupportModal';

export default function HelpSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:scale-105 transition-transform z-[9999] flex items-center justify-center hidden sm:flex"
        aria-label="Help"
      >
        <span className="material-symbols-outlined text-[20px]">help</span>
      </button>
      {isOpen && <HelpSupportModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
