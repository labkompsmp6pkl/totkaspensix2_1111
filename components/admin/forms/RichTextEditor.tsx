import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  // Simple implementation for now, can be replaced with a real rich text editor like React Quill
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[150px]"
      placeholder={placeholder}
    />
  );
};

export default RichTextEditor;
