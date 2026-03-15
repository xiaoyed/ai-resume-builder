import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiLogPanelProps {
  logs: string[];
  isStreaming: boolean;
}

export function AiLogPanel({ logs, isStreaming }: AiLogPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 日志更新时，自动滚动到最底部
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isStreaming]);

  return (
    <div className="flex flex-col h-full border-t border-muted/50">
      <div className="p-3 border-b bg-muted/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-gray-700">AI 实时调整日志</h2>
        {isStreaming && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </div>
      <ScrollArea className="flex-1 p-4 bg-muted/5">
        {logs.length === 0 && !isStreaming ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic h-32">
            等待输入 JD 和建立分析...
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                className="bg-white p-3 rounded-md shadow-sm border border-black/5 text-sm w-full animate-in fade-in slide-in-from-bottom-2 text-gray-700"
              >
                <div className="text-xs text-primary font-semibold mb-1">思考阶段 {idx + 1}</div>
                {log}
              </div>
            ))}
            {isStreaming && (
              <div className="text-xs text-muted-foreground animate-pulse italic mt-4 pl-2">
                AI 正在生成内容...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
