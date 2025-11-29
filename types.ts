export enum MessageRole {
  User = 'user',
  Model = 'model',
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  images?: string[]; // Base64 strings
  timestamp: number;
  isStreaming?: boolean;
  latency?: number; // ms to first token
}

export interface GenerationStats {
  tokenCount: number;
  totalTime: number;
}