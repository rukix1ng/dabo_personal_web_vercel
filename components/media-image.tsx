"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { createPortal } from "react-dom";

interface MediaImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  gallery?: { src: string; alt: string }[];
  initialIndex?: number;
  priority?: boolean;
}

export function MediaImage({ src, alt, fallbackSrc, className, sizes, gallery, initialIndex = 0, priority = false }: MediaImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentGalleryIndex(initialIndex);
  }, [initialIndex]);

  const imagesList = gallery || [{ src, alt }];
  const currentImage = imagesList[currentGalleryIndex] || { src, alt };

  useEffect(() => {
    setMounted(true);
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentGalleryIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentGalleryIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center bg-muted ${className}`}>
        <Calendar className="h-12 w-12 text-muted-foreground opacity-50" />
      </div>
    );
  }

  const modalContent = isZoomed && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 cursor-zoom-out"
      onClick={() => setIsZoomed(false)}
    >
      <div className="relative h-[90vh] w-[90vw] animate-in zoom-in-95 duration-300 ease-out">
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          className="object-contain"
          priority
          unoptimized
        />

        {/* Gallery Navigation */}
        {imagesList.length > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-4 text-white hover:text-primary transition-colors sm:-translate-x-12"
              onClick={(e) => {
                e.stopPropagation();
                prevImage(e);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-4 text-white hover:text-primary transition-colors sm:translate-x-12"
              onClick={(e) => {
                e.stopPropagation();
                nextImage(e);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {currentGalleryIndex + 1} / {imagesList.length}
            </div>
          </>
        )}

        {/* Close button */}
        <button
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors cursor-pointer sm:-top-8 sm:-right-8"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(false);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="group/image relative h-full w-full cursor-pointer overflow-hidden"
        onClick={() => setIsZoomed(true)}
      >
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes={sizes}
          className={`object-cover transition-all duration-500 ${className || ""} group-hover/image:scale-105 group-hover/image:brightness-90`}
          onError={() => {
            if (fallbackSrc && currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
            } else {
              setHasError(true);
            }
          }}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
          loading={priority ? undefined : "lazy"}
          priority={priority}
          quality={75}
        />
        {/* Hover icon indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/image:opacity-100">
          <div className="rounded-full bg-background/20 p-3 backdrop-blur-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <line x1="11" x2="11" y1="8" y2="14" />
              <line x1="8" x2="14" y1="11" y2="11" />
            </svg>
          </div>
        </div>
      </div>

      {/* Global Zoom Overlay (Portal to Body) */}
      {mounted && isZoomed && createPortal(modalContent, document.body)}
    </>
  );
}
