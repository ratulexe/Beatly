import React, { Suspense, lazy, useState } from 'react';
import { Bot, X } from 'lucide-react';

const FloatingChatPanel = lazy(() => import('./FloatingChatPanel'));

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 ${isOpen ? 'bg-[#282828] text-white' : 'bg-[#1DB954] text-black'}`}
        >
          {isOpen ? <X size={28} /> : <Bot size={28} />}
        </button>
      </div>

      {isOpen && (
        <Suspense fallback={null}>
          <FloatingChatPanel isOpen={isOpen} />
        </Suspense>
      )}
    </>
  );
};

export default FloatingChat;
