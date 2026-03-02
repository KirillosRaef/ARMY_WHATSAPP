import { useState } from "react";
import { Button } from "./ui/button";
import { Fullscreen, X } from "lucide-react";


export default function ViewImage({ src, alt, imageClassName }: { src: string, alt: string, imageClassName?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
  <div>
    <Button onClick={() => setIsModalOpen(true)} variant="ghost" className="h-auto w-auto p-0 hover:bg-transparent">
      <img
        src={src}
        alt={alt}
        className={imageClassName || "w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"}
        loading="lazy"
      />
    </Button>

    {isModalOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'oklch(0 0 0 / 75%)', backdropFilter: 'blur(8px)' }}
      >
        <div
          className="relative flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: 'oklch(0.155 0.02 264)', width: 400, maxWidth: '95vw' }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <Fullscreen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">View Serial Number Image</span>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Image */}
          <div>
            <img
              style={{ position: 'relative', width: '100%', height: 380 }}
              src={src}
              alt={alt}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    )}
    </div>
  );
}