import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { X, Share2, Download, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import StorySlide from './StorySlide';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';

const DURATION = 6000;

export default function StoryViewer({ slides, theme = 'classic', onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();
  const exportRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, slides.length, onComplete]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 16;
    const step = (interval / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  useEffect(() => {
    if (progress >= 100) {
      nextSlide();
    }
  }, [progress, nextSlide]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handlePointerDown = (e) => {
    setIsPaused(true);
  };

  const handlePointerUp = (e) => {
    setIsPaused(false);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      prevSlide();
    } else if (x > (width * 2) / 3) {
      nextSlide();
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async (e) => {
    if (e) e.stopPropagation();
    const currentRef = exportRef.current;
    console.log('[StoryViewer] Export PDF button clicked! Ref:', !!currentRef, 'isExporting:', isExporting);
    if (!currentRef || isExporting) return;
    setIsExporting(true);
    try {
      const filter = (node) => !node.classList?.contains('export-exclude');
      const dataUrl = await htmlToImage.toPng(currentRef, { pixelRatio: 2, filter });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [currentRef.offsetWidth, currentRef.offsetHeight]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, currentRef.offsetWidth, currentRef.offsetHeight);
      pdf.save('beatly-wrapped.pdf');
      showToast('PDF Exported Successfully!');
    } catch (err) {
      console.error('Failed to export PDF', err);
      showToast('Failed to export PDF! Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPNG = async (e) => {
    if (e) e.stopPropagation();
    const currentRef = exportRef.current;
    console.log('[StoryViewer] Save Image button clicked! Ref:', !!currentRef, 'isExporting:', isExporting);
    if (!currentRef || isExporting) return;
    setIsExporting(true);
    try {
      const filter = (node) => !node.classList?.contains('export-exclude');
      const dataUrl = await htmlToImage.toPng(currentRef, { pixelRatio: 2, filter });
      const link = document.createElement('a');
      link.download = 'beatly-wrapped.png';
      link.href = dataUrl;
      link.click();
      showToast('Image Saved Successfully!');
    } catch (err) {
      console.error('Failed to export PNG', err);
      showToast('Failed to save image! Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const isFinalSlide = currentIndex === slides.length - 1;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black theme-${theme}`}
      style={{
        background: 'var(--wrapped-bg)',
        color: 'var(--wrapped-text)'
      }}
    >
      {isFinalSlide && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.1}
          colors={['#1ED760', '#ff00ff', '#00ffcc', '#e94560', '#a1c4fd']}
          style={{ zIndex: 100, pointerEvents: 'none' }}
        />
      )}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 z-[100] px-6 py-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Container */}
      <div 
        className={`relative w-full max-w-md h-full max-h-[900px] sm:h-[90vh] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col theme-${theme}`}
        {...swipeHandlers}
        ref={(el) => {
          if (swipeHandlers.ref) swipeHandlers.ref(el);
          exportRef.current = el;
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setIsPaused(false)}
        style={{
          background: 'var(--wrapped-bg)',
          color: 'var(--wrapped-text)'
        }}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 w-full z-20 flex gap-1 p-4 pt-6 export-exclude">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white transition-all duration-[16ms] ease-linear"
                style={{
                  width: `${i < currentIndex ? 100 : i === currentIndex ? progress : 0}%`
                }}
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute top-8 right-4 z-20 flex gap-4 export-exclude">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/dashboard'); }}
            className="p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Slides */}
        <div className="relative flex-1">
          <AnimatePresence initial={false} custom={direction}>
            {slides.map((slide, i) => (
              <StorySlide key={i} isActive={i === currentIndex} direction={direction}>
                <div className="flex flex-col items-center justify-center h-full w-full relative">
                  {/* Beatly Logo Watermark for exports */}
                  <div className="absolute top-10 left-4 flex items-center gap-2 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-[var(--wrapped-primary)] flex items-center justify-center text-black font-extrabold text-xs">B</div>
                    <span className="font-bold text-sm tracking-widest">BEATLY WRAPPED</span>
                  </div>
                  
                  {slide.content}

                  {/* Final Slide Export Buttons */}
                  {i === slides.length - 1 && (
                    <div className="mt-12 flex gap-4 export-exclude relative z-50">
                      <button 
                        onPointerDown={exportPNG} 
                        onPointerUp={e => e.stopPropagation()}
                        disabled={isExporting} 
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md font-bold text-sm transition disabled:opacity-50 relative z-50 cursor-pointer"
                      >
                        <ImageIcon size={18} /> {isExporting ? 'Exporting...' : 'Save Image'}
                      </button>
                      <button 
                        onPointerDown={exportPDF} 
                        onPointerUp={e => e.stopPropagation()}
                        disabled={isExporting} 
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--wrapped-primary)] text-black hover:bg-opacity-90 font-bold text-sm transition disabled:opacity-50 relative z-50 cursor-pointer"
                      >
                        <Download size={18} /> {isExporting ? 'Exporting...' : 'Export PDF'}
                      </button>
                    </div>
                  )}
                </div>
              </StorySlide>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
