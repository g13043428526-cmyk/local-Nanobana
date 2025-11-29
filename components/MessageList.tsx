import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { BoltIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.text]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
                    <BoltIcon className="w-24 h-24 text-zinc-700 mb-4" />
                    <h1 className="text-4xl font-bold text-zinc-700 tracking-tighter">NANO BANANA</h1>
                    <p className="text-zinc-600 mt-2 font-mono text-sm">Waiting for input...</p>
                </div>
            )}

            {messages.map((msg) => (
                <div
                key={msg.id}
                className={`flex gap-4 max-w-3xl mx-auto ${
                    msg.role === MessageRole.User ? 'justify-end' : 'justify-start'
                } animate-slide-up`}
                >
                {msg.role === MessageRole.Model && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banana-400 to-banana-600 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                    <BoltIcon className="w-5 h-5 text-black" />
                    </div>
                )}

                <div
                    className={`flex flex-col max-w-[85%] ${
                    msg.role === MessageRole.User ? 'items-end' : 'items-start'
                    }`}
                >
                    <div
                    className={`rounded-2xl px-5 py-3.5 shadow-md backdrop-blur-sm ${
                        msg.role === MessageRole.User
                        ? 'bg-zinc-800/80 text-white rounded-br-none border border-zinc-700'
                        : 'bg-zinc-900/50 text-zinc-100 rounded-bl-none border border-zinc-800/50'
                    }`}
                    >
                        {/* User Input Images */}
                        {msg.role === MessageRole.User && msg.images && msg.images.length > 0 && (
                            <div className="flex gap-2 mb-2 flex-wrap justify-end">
                                {msg.images.map((img, i) => (
                                    <div key={i} className="cursor-zoom-in overflow-hidden rounded-lg border border-zinc-600 group relative" onClick={() => setSelectedImage(`data:image/jpeg;base64,${img}`)}>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <img src={`data:image/jpeg;base64,${img}`} className="h-32 object-cover" alt="User upload" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Text Content */}
                        <div className="whitespace-pre-wrap leading-relaxed font-sans text-[15px]">
                            {msg.text}
                        </div>

                        {/* Model Generated Images */}
                        {msg.role === MessageRole.Model && msg.images && msg.images.length > 0 && (
                            <div className="mt-3 grid gap-2">
                                {msg.images.map((img, i) => (
                                    <div key={i} className="cursor-zoom-in overflow-hidden rounded-xl border border-zinc-800 shadow-lg group relative" onClick={() => setSelectedImage(`data:image/jpeg;base64,${img}`)}>
                                         <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors" />
                                         <img src={`data:image/jpeg;base64,${img}`} className="w-full object-cover" alt="Generated content" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                        {msg.role === MessageRole.Model && msg.latency !== undefined && (
                            <span className="text-[10px] font-mono text-banana-400 flex items-center gap-1 opacity-80">
                                <span className="w-1.5 h-1.5 rounded-full bg-banana-400 animate-pulse"></span>
                                {msg.latency.toFixed(0)}ms
                            </span>
                        )}
                        {msg.isStreaming && (
                            <span className="text-[10px] font-mono text-zinc-500 animate-pulse">Generating...</span>
                        )}
                    </div>

                </div>

                {msg.role === MessageRole.User && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                        <UserIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                )}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>

        {/* Full Screen Image Preview Modal */}
        {selectedImage && (
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-fadeIn"
                onClick={() => setSelectedImage(null)}
            >
                <div className="absolute top-4 right-4 z-50">
                     <button 
                        onClick={() => setSelectedImage(null)}
                        className="p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-all border border-zinc-700/50"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
               
                <img 
                    src={selectedImage} 
                    className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
                    alt="Preview"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        )}
    </>
  );
};

export default MessageList;