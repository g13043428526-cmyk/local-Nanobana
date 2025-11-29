import React, { useState, useRef, ChangeEvent } from 'react';
import { PaperClipIcon, ArrowUpIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface InputAreaProps {
  onSend: (text: string, images: string[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]); // Base64 strings
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data prefix for API
        const base64 = result.split(',')[1];
        setImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!text.trim() && images.length === 0) || isLoading) return;
    onSend(text, images);
    setText('');
    setImages([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
        {/* Image Preview Row */}
        {images.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group shrink-0">
                        <img 
                            src={`data:image/jpeg;base64,${img}`} 
                            alt="preview" 
                            className="h-16 w-16 object-cover rounded-lg border border-zinc-700" 
                        />
                        <button 
                            onClick={() => removeImage(idx)}
                            className="absolute -top-1 -right-1 bg-zinc-800 rounded-full p-0.5 text-zinc-400 hover:text-white"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}

      <div className="relative flex items-end gap-2 bg-charcoal rounded-3xl border border-zinc-800 focus-within:border-zinc-600 transition-colors p-2 shadow-lg shadow-black/50">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-zinc-400 hover:text-banana-400 transition-colors rounded-full hover:bg-zinc-800"
          title="Add image"
        >
          <PaperClipIcon className="w-6 h-6" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nano Banana..."
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-zinc-500 py-3 px-2 resize-none focus:outline-none max-h-[120px] overflow-y-auto font-sans text-lg"
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && images.length === 0) || isLoading}
          className={`p-3 rounded-full transition-all duration-200 ${
            text.trim() || images.length > 0
              ? 'bg-banana-400 text-black hover:bg-banana-300 hover:scale-105 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
                <ArrowUpIcon className="w-6 h-6 font-bold" />
            )}
        </button>
      </div>
      <div className="text-center mt-2">
         <p className="text-[10px] text-zinc-600 font-mono">GEMINI-2.5-FLASH-IMAGE • LOW LATENCY</p>
      </div>
    </div>
  );
};

export default InputArea;