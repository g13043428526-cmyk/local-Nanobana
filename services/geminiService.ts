import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { ChatMessage, MessageRole } from "../types";

// The "Nano Banana" model mapping as per instructions
const MODEL_NAME = 'gemini-2.5-flash-image';

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // API Key is injected via process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Sends a message to the model and streams the response.
   * Supports multimodal input (text + images) and history.
   */
  async *streamResponse(
    history: ChatMessage[],
    currentPrompt: string,
    inputImages: string[] = [] // Base64 strings without data URI prefix
  ): AsyncGenerator<{ text: string; image?: string; isFirstChunk: boolean }> {
    
    // Construct request contents based on history
    const contents: Content[] = [];

    // 1. Add previous history (Simple text-only history for efficiency in this "Nano" demo)
    // Excluding the current message which is added explicitly below
    const previousMessages = history.slice(0, -1); 
    
    for (const msg of previousMessages) {
        // Skip messages that are empty/streaming placeholders unless they have content
        if (!msg.text && (!msg.images || msg.images.length === 0)) continue;

        const parts: any[] = [];
        if (msg.text) parts.push({ text: msg.text });
        
        // Note: We are not sending back previous images to save bandwidth/tokens for this "Nano" speed demo,
        // but normally you would include them.
        
        contents.push({
            role: msg.role === MessageRole.User ? 'user' : 'model',
            parts: parts
        });
    }

    // 2. Add current message
    const currentParts: any[] = [];
    
    // Add images if any
    for (const imgBase64 of inputImages) {
      currentParts.push({
        inlineData: {
          mimeType: 'image/jpeg', 
          data: imgBase64,
        },
      });
    }

    if (currentPrompt) {
      currentParts.push({ text: currentPrompt });
    }

    contents.push({
        role: 'user',
        parts: currentParts
    });

    try {
      const responseStream = await this.ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: contents,
        config: {
            // Optional configs
        }
      });

      let isFirstChunk = true;

      for await (const chunk of responseStream) {
        // Check for text
        const text = chunk.text || '';
        
        // Check for generated images (Flash Image model can output images)
        let image: string | undefined = undefined;
        
        if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
            for (const part of chunk.candidates[0].content.parts) {
                if (part.inlineData) {
                    image = part.inlineData.data;
                }
            }
        }

        yield { text, image, isFirstChunk };
        isFirstChunk = false;
      }
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      yield { text: "\n[Error: Failed to generate response. Please check your connection or API key.]", isFirstChunk: false };
    }
  }
}

export const geminiService = new GeminiService();