import { useState } from 'react';
import { ArrowLeft, Send, Bot, User, Camera, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createAIResponse } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
}

interface AIChatProps {
  onBack: () => void;
}

export function AIChat({ onBack }: AIChatProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !apiKeyExists(selectedProvider)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    // Create AI message placeholder immediately
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await createAIResponse(
        [...messages, userMessage].map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : m.content
        })),
        selectedProvider
      );

      // Stream the response using textStream
      for await (const textPart of result.textStream) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: (msg.content as string) + textPart }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: 'Sorry, I encountered an error processing your request.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshot = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const base64Image = await invoke('take_screenshot') as string;

      // Add the screenshot to the chat as a multimodal message
      const screenshotMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: [
          { type: 'text', text: 'Screenshot attached:' },
          { type: 'image', image: base64Image }
        ],
      };

      setMessages(prev => [...prev, screenshotMessage]);
      console.log('Screenshot captured and added to chat');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  const apiKeyExists = (provider: 'openai' | 'gemini') => {
    return !!localStorage.getItem(`${provider}-api-key`);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] dark:bg-[#1C1C1C]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-7 w-7 p-0 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Chat</h2>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="h-6 w-6 p-0 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <div className="flex gap-1">
            <Button
              variant={selectedProvider === 'openai' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedProvider('openai')}
              className="h-6 px-2 text-xs"
              disabled={!apiKeyExists('openai')}
            >
              OpenAI
            </Button>
            <Button
              variant={selectedProvider === 'gemini' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedProvider('gemini')}
              className="h-6 px-2 text-xs"
              disabled={!apiKeyExists('gemini')}
            >
              Gemini
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            Start a conversation with AI
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                {message.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}>
                {typeof message.content === 'string' ? (
                  message.role === 'assistant' ? (
                    message.content.length > 0 ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">{children}</code>
                            ) : (
                              <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                                <code>{children}</code>
                              </pre>
                            );
                          },
                          pre: ({ children }) => <div>{children}</div>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-2 mt-3 first:mt-0">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      isLoading && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )
                    )
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )
                ) : (
                  <div>
                    {message.content.map((part, index) => (
                      <div key={index}>
                        {part.type === 'text' && part.text && (
                          <div className="whitespace-pre-wrap">{part.text}</div>
                        )}
                        {part.type === 'image' && part.image && (
                          <img
                            src={part.image}
                            alt="Screenshot"
                            className="mt-2 max-w-full h-auto rounded border"
                            style={{ maxHeight: '200px' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI a question..."
            className="flex-1 text-sm h-9"
            disabled={!apiKeyExists(selectedProvider)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleScreenshot}
            className="h-9 w-9 p-0 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !input.trim() || !apiKeyExists(selectedProvider)}
            className="h-9 w-9 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {!apiKeyExists(selectedProvider) && (
          <p className="text-xs text-red-500 mt-2">
            Please add a {selectedProvider === 'openai' ? 'OpenAI' : 'Gemini'} API key in settings
          </p>
        )}
      </div>
    </div>
  );
}
