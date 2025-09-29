import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function createAIResponse(messages: any[], provider: 'openai' | 'gemini') {
  const apiKey = localStorage.getItem(`${provider}-api-key`);

  if (!apiKey) {
    throw new Error(`No API key found for ${provider}`);
  }

  let model;
  if (provider === 'openai') {
    const openai = createOpenAI({ apiKey });
    model = openai('gpt-5');
  } else {
    const google = createGoogleGenerativeAI({ apiKey });
    model = google('gemini-2.5-pro');
  }

  // Convert multimodal messages to proper format
  const formattedMessages = messages.map(message => {
    if (Array.isArray(message.content)) {
      // Convert image content to proper format
      const content = message.content.map((part: any) => {
        if (part.type === 'image' && part.image) {
          return {
            type: 'image',
            image: part.image // AI SDK expects base64 string directly
          };
        }
        return {
          type: 'text',
          text: part.text || ''
        };
      });
      return {
        role: message.role,
        content
      };
    }
    return message;
  });

  return streamText({
    model,
    messages: formattedMessages,
    abortSignal: undefined, // No timeout
  });
}