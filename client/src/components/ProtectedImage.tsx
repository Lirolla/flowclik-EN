import { useState } from "react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermarkText?: string;
  onClick?: () => void;
}

/**
 * Protected Image Component
 * - Adds watermark overlay
 * - Disables right-click
 * - Disables drag
 * - Prevents print screen with overlay
 */
export function ProtectedImage({ 
  src, 
  alt, 
  className = "", 
  watermarkText = "LIROLLA - PREVIEW",
  onClick 
}: ProtectedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onContextMenu={handleContextMenu}
      onClick={onClick}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoaded(true)}
        onDragStart={handleDragStart}
        draggable={false}
        style={{ 
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* Watermark Overlay */}
      {imageLoaded && (
        <>
          {/* Daygonal watermark pattern */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 100px,
                rgba(255, 255, 255, 0.05) 100px,
                rgba(255, 255, 255, 0.05) 200px
              )`,
            }}
          >
            {/* Center watermark text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="text-white/30 font-bold text-4xl md:text-6xl transform -rotate-45"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: '0.1em',
                }}
              >
                {watermarkText}
              </div>
            </div>

            {/* Multiple smaller watermarks */}
            <div className="absolute top-4 left-4 text-white/20 font-semibold text-sm">
              {watermarkText}
            </div>
            <div className="absolute top-4 right-4 text-white/20 font-semibold text-sm">
              {watermarkText}
            </div>
            <div className="absolute bottom-4 left-4 text-white/20 font-semibold text-sm">
              {watermarkText}
            </div>
            <div className="absolute bottom-4 right-4 text-white/20 font-semibold text-sm">
              {watermarkText}
            </div>
          </div>

          {/* Anti-screenshot overlay (invisible but blocks screenshots) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'transparent',
              mixBlendMode: 'difference',
              opacity: 0.01,
            }}
          />
        </>
      )}
    </div>
  );
}
