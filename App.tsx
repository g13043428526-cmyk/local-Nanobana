import React, { useState, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { ChatMessage, MessageRole } from './types';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import { SparklesIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async (text: string, images: string[]) => {
    // 1. Add User Message
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: MessageRole.User,
      text: text,
      images: images,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    // 2. Prepare Placeholder for Model Message
    const modelMsgId = (Date.now() + 1).toString();
    const startTime = performance.now();
    let firstTokenTime: number | null = null;

    const initialModelMsg: ChatMessage = {
      id: modelMsgId,
      role: MessageRole.Model,
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
      images: [],
    };

    setMessages((prev) => [...prev, initialModelMsg]);

    try {
      // 3. Stream Response
      const stream = geminiService.streamResponse(messages, text, images);
      
      let fullText = '';
      const generatedImages: string[] = [];

      for await (const chunk of stream) {
        if (!firstTokenTime) {
            firstTokenTime = performance.now();
        }

        if (chunk.text) {
          fullText += chunk.text;
        }
        
        if (chunk.image) {
            generatedImages.push(chunk.image);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMsgId
              ? {
                  ...msg,
                  text: fullText,
                  images: generatedImages.length > 0 ? generatedImages : undefined,
                  latency: firstTokenTime ? firstTokenTime - startTime : 0,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Stream error", error);
    } finally {
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-obsidian text-zinc-100 font-sans selection:bg-banana-400 selection:text-black">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center px-6 justify-between bg-charcoal/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <div className="relative">
                <div className="absolute inset-0 bg-banana-400 blur-lg opacity-20 rounded-full"></div>
                <SparklesIcon className="w-6 h-6 text-banana-400 relative z-10" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Nano Banana <span className="text-[10px] font-mono text-banana-400 border border-banana-400/30 px-1 py-0.5 rounded ml-2 align-middle">LIVE</span>
            </span>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                 <span className="text-xs font-mono text-zinc-500">SYSTEM ONLINE</span>
             </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
         {/* Background Ambient Glow */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-banana-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
         <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

        <MessageList messages={messages} />
        
        <div className="pb-4 pt-2 bg-gradient-to-t from-obsidian via-obsidian to-transparent z-10">
            <InputArea onSend={handleSend} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;