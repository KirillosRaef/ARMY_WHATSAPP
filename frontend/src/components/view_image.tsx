import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export default function ViewImage({ src, alt, imageClassName, isClickable = true }: { src: string, alt: string, imageClassName?: string, isClickable?: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageElement = (
    <img
      src={src}
      alt={alt}
      className={imageClassName || "w-10 h-10 object-cover rounded-lg border border-border/30 shadow-sm"}
      loading="lazy"
    />
  );

  // Close on Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [isModalOpen]);

  return (
    <div>
      {isClickable ? (
        <Button
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          variant="ghost"
          className="h-auto w-auto p-0 hover:bg-transparent"
        >
          {imageElement}
        </Button>
      ) : (
        imageElement
      )}

      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Cinematic backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(20px) saturate(0.5)',
              WebkitBackdropFilter: 'blur(20px) saturate(0.5)',
            }}
          />

          {/* Close button - floating top right */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image container */}
          <div
            className="relative flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <img
              src={src}
              alt={alt}
              className="rounded-xl shadow-2xl object-contain"
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                background: 'white',
              }}
              loading="lazy"
            />
          </div>

          {/* Bottom bar with image info */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 rounded-full bg-white/10 backdrop-blur-md px-5 py-2.5 border border-white/10">
            <span className="text-sm text-white/70 font-medium truncate max-w-[300px]">{alt}</span>
            <div className="h-3.5 w-px bg-white/20" />
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/90 hover:text-white font-medium transition-colors whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
            >
              Open original ↗
            </a>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}