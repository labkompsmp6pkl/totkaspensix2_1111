
import React, { useState } from 'react';

interface MediaRendererProps {
  url?: string;
  className?: string;
}

const MediaRenderer: React.FC<MediaRendererProps> = ({ url, className }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!url || url.trim() === '') return null;

  const cleanUrl = url.trim();
  const isGDrive = cleanUrl.includes('drive.google.com');
  const isVideo = cleanUrl.match(/\.(mp4|webm|ogg)$/i) || cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');

  const renderContent = () => {
    if (isGDrive) {
      let embedUrl = cleanUrl;
      const fileIdMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      
      if (fileId) {
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        return (
          <iframe 
            src={embedUrl} 
            className="w-full h-full border-none" 
            allow="autoplay; encrypted-media" 
            allowFullScreen
            title="Drive Media"
          ></iframe>
        );
      }
    }

    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      let ytId = '';
      if (cleanUrl.includes('v=')) ytId = cleanUrl.split('v=')[1].split('&')[0];
      else if (cleanUrl.includes('youtu.be/')) ytId = cleanUrl.split('youtu.be/')[1].split('?')[0];
      
      if (ytId) {
         return (
           <iframe 
             src={`https://www.youtube.com/embed/${ytId}`} 
             className="w-full h-full" 
             allowFullScreen
             title="Youtube Video"
           ></iframe>
         );
      }
    }

    if (isVideo && !isGDrive) {
      return (
        <video controls className="w-full h-auto max-h-[300px]">
          <source src={cleanUrl} />
          Browser Anda tidak mendukung tag video.
        </video>
      );
    }

    return (
      <img 
        src={cleanUrl} 
        alt="Konten Soal" 
        className={`max-w-full h-auto max-h-[250px] object-contain transition-all duration-300 ${isZoomed ? 'scale-150 fixed inset-0 z-[5000] bg-black/80 p-10 cursor-zoom-out' : 'cursor-zoom-in'}`} 
        onClick={() => setIsZoomed(!isZoomed)}
        loading="lazy"
        onError={(e) => {
           const parent = e.currentTarget.parentElement;
           if (parent) parent.style.display = 'none';
        }} 
      />
    );
  };

  return (
    <div className={`flex justify-start w-full my-3 sm:my-4 ${className}`}>
      <div className={`relative bg-white p-1 sm:p-2 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center ${isVideo || isGDrive ? 'w-full max-w-xl aspect-video' : 'w-fit'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default MediaRenderer;
