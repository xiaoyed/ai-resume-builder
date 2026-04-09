import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JdPanelProps {
  jdText: string;
  onChange: (val: string) => void;
  apiKey: string;
  onApiKeyChange: (val: string) => void;
  baseUrl: string;
  onBaseUrlChange: (val: string) => void;
  model: string;
  onModelChange: (val: string) => void;
  onOptimize: () => void;
  isLoading: boolean;
  canOptimize: boolean;
}

export function JdPanel({ 
  jdText, onChange, apiKey, onApiKeyChange, baseUrl, onBaseUrlChange, model, onModelChange, onOptimize, isLoading, canOptimize 
}: JdPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <h2 className="text-lg font-semibold tracking-tight">目标岗位要求 (JD)</h2>
      <Textarea 
        placeholder="请粘贴详细的 Job Description..." 
        className="flex-1 min-h-[120px] resize-none"
        value={jdText}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      />
      <div className="space-y-3 bg-muted/30 p-3 rounded-md border text-sm">
        <h3 className="font-medium text-gray-700">AI 模型配置</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 col-span-2">
            <Label className="text-xs text-gray-500">API Key <span className="text-red-500">*</span></Label>
            <Input 
              type="password" 
              placeholder="sk-xxxxxxxx" 
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onApiKeyChange(e.target.value)}
              disabled={isLoading}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Base URL <span className="text-red-500">*</span></Label>
            <Input 
              type="text" 
              placeholder="https://api.moonshot.cn/v1" 
              value={baseUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onBaseUrlChange(e.target.value)}
              disabled={isLoading}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Model <span className="text-red-500">*</span></Label>
            <select
              value={model}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onModelChange(e.target.value)}
              disabled={isLoading}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="moonshot-v1-8k">moonshot-v1-8k (推荐/常规简历)</option>
              <option value="moonshot-v1-32k">moonshot-v1-32k (长简历适用)</option>
              <option value="moonshot-v1-128k">moonshot-v1-128k (超长简历/多JD参考)</option>
              <option value="moonshot-v1-auto">moonshot-v1-auto (自动选择)</option>
            </select>
          </div>
        </div>
      </div>
      <Button 
        className="w-full flex items-center gap-2" 
        size="lg" 
        onClick={onOptimize}
        disabled={isLoading || !canOptimize}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isLoading ? 'AI 正在全力优化中...' : '智能优化简历'}
      </Button>
    </div>
  );
}
