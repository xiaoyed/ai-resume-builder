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
  onOptimize: () => void;
  isLoading: boolean;
  canOptimize: boolean;
}

export function JdPanel({ jdText, onChange, apiKey, onApiKeyChange, baseUrl, onBaseUrlChange, onOptimize, isLoading, canOptimize }: JdPanelProps) {
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
        <h3 className="font-medium text-gray-700">AI 模型配置 (用于 GitHub 开源自部署)</h3>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">API Key <span className="text-red-500">*</span></Label>
          <Input 
            type="password" 
            placeholder="例如: sk-xxxxxxxx (必填项)" 
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
            placeholder="例如: https://dashscope.aliyuncs.com/compatible-mode/v1 (必填项)" 
            value={baseUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onBaseUrlChange(e.target.value)}
            disabled={isLoading}
            className="h-8"
          />
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
