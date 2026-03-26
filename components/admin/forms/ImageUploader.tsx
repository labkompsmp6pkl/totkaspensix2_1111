import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <ImageIcon className="w-4 h-4" />
        </div>
        <input 
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreview(e.target.value);
          }}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {preview && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain"
            onError={() => setPreview('')}
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={() => {
              onChange('');
              setPreview('');
            }}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm text-rose-600 rounded-xl hover:bg-white transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
