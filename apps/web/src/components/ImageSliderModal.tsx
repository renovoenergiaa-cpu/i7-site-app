'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Camera, 
  Image as ImageIcon 
} from 'lucide-react';

export interface SlideImage {
  url: string;
  alt?: string;
  caption?: string;
}

interface ImageSliderModalProps {
  images: SlideImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageSliderModal: React.FC<ImageSliderModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  // Sincroniza o index inicial quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // Rola o carrossel de miniaturas para manter a foto ativa visível
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const activeThumb = thumbnailScrollRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Gestos de Swipe no mobile / touch
  const minSwipeDistance = 45;

  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3 text-white min-w-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-brand-lime" />
          </div>
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                {title}
              </h3>
            )}
            <span className="text-xs text-white/70 font-mono">
              Foto {currentIndex + 1} de {images.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Tela Cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-brand-lime transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-brand-lime text-white hover:text-black flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-brand-lime hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Current Image Container */}
        <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.alt || `Foto ${currentIndex + 1}`}
            className="max-w-full max-h-[72vh] sm:max-h-[75vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 animate-in fade-in zoom-in-95"
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-brand-lime text-white hover:text-black flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-brand-lime hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Carousel Strip */}
      {images.length > 1 && (
        <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-6 z-10">
          <div 
            ref={thumbnailScrollRef}
            className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto max-w-4xl mx-auto py-1 px-2 no-scrollbar"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-14 sm:h-16 w-20 sm:w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  currentIndex === idx 
                    ? 'border-brand-lime scale-105 shadow-glow-lime opacity-100 ring-2 ring-brand-lime/40' 
                    : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50'
                }`}
                aria-label={`Ir para a foto ${idx + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
