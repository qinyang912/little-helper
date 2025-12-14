import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Small delay to allow render before animation starts
      setTimeout(() => setAnimate(true), 10);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      setAnimate(false);
      const timer = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Bottom Sheet / Modal Card */}
      <div 
        className={`
          relative w-full max-w-lg bg-white 
          rounded-t-[30px] sm:rounded-[40px] 
          p-6 sm:p-8 
          shadow-[0_-10px_40px_rgba(0,0,0,0.1)] 
          transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
          ${animate ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 sm:scale-95'}
          max-h-[90vh] overflow-y-auto
        `}
      >
        {/* Handle bar for mobile feel */}
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden"></div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 active:scale-90 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="pb-safe">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;