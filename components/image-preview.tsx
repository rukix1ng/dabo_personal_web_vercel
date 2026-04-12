"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ImagePreviewProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export function ImagePreview({ src, alt, fallbackSrc, className }: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  const modalContent = isZoomed && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 cursor-zoom-out"
      onClick={() => setIsZoomed(false)}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(false);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <div className="relative max-h-[90vh] max-w-[90vw] animate-in zoom-in-95 duration-300 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentSrc}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onError={handleError}
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        className="group/image relative cursor-pointer"
        onClick={() => setIsZoomed(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          onError={handleError}
        />
        {/* Hover icon indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/image:opacity-100">
          <div className="rounded-full bg-black/40 p-3 backdrop-blur-md">
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
      {isZoomed && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
