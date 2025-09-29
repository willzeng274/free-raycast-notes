import { useState } from 'react';
import { ArrowLeft, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SettingsPanelProps {
  onBack: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('openai-api-key') || '',
    gemini: localStorage.getItem('gemini-api-key') || '',
  });

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    localStorage.setItem(`${provider}-api-key`, value);
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
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md space-y-6">
          {/* API Keys Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">API Keys</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OpenAI API Key
                </label>
                <Input
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Google Gemini API Key
                </label>
                <Input
                  type="password"
                  value={apiKeys.gemini}
                  onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                  placeholder="AI..."
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}