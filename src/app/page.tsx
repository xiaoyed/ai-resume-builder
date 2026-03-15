'use client';

import { useState } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { JdPanel } from '@/components/JdPanel';
import { AiLogPanel } from '@/components/AiLogPanel';
import { ResumeUploader } from '@/components/ResumeUploader';
import { exportToPdf } from '@/lib/exportPdf';
import { exportToWord } from '@/lib/exportWord';

export default function Home() {
  const [parsedResume, setParsedResume] = useState<string>('');
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  
  const [jdText, setJdText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleParsed = (text: string) => {
    setParsedResume(text);
    setIsParsingPdf(false);
  };

  const handleParsingStart = () => {
    setIsParsingPdf(true);
  };

  const handleParsingError = (err: Error) => {
    console.error('PDF 解析失败:', err);
    setIsParsingPdf(false);
    alert('PDF 解析失败，请重试或者检查 PDF 文件是否损坏。');
  };

  const handleOptimize = async () => {
    if (!parsedResume.trim()) {
      alert('请先上传简历');
      return;
    }
    if (!jdText.trim()) {
      alert('请粘贴 Job Description (JD)');
      return;
    }
    if (!apiKey.trim()) {
      alert('请在右侧控制面板填入您的 API Key');
      return;
    }
    if (!baseUrl.trim()) {
      alert('请在右侧控制面板填入您的 Base URL');
      return;
    }

    setIsOptimizing(true);
    setLogs([]); // 清空上次的日志

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: parsedResume, jdText, apiKey, baseUrl }),
      });

      if (!res.ok) {
        throw new Error('网络请求失败');
      }

      if (!res.body) {
        throw new Error('没有返回可读流');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let done = false;
      let accumulatedText = '';
      let logBuffer = '';
      let isCapturingLog = false;
      let isCapturingResume = false;
      let newResumeBuffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        // 简易的状态机解析 <log>...</log> 和 <resume>...</resume> 标签流
        // 这是一种简单的增量解析方式，因为 chunk 可能在任何地方截断
        let tempText = accumulatedText;
        let logsList: string[] = [];
        
        // 提取所有完整的 <log>
        const logRegex = /<log>([\s\S]*?)<\/log>/g;
        let match;
        while ((match = logRegex.exec(tempText)) !== null) {
          logsList.push(match[1].trim());
        }
        
        // 如果有新的 log 就更新状态
        if (logsList.length > 0) {
          setLogs(logsList);
        }

        // 处理实时更新简历区域 (如果检测到 <resume>)
        const resumeStartIdx = tempText.indexOf('<resume>');
        if (resumeStartIdx !== -1) {
          const contentAfterResume = tempText.substring(resumeStartIdx + 8);
          const resumeEndIdx = contentAfterResume.indexOf('</resume>');
          
          if (resumeEndIdx !== -1) {
             // 完整的 resume 被闭合
             setParsedResume(contentAfterResume.substring(0, resumeEndIdx).trim());
          } else {
             // resume 还未闭合，流式更新
             setParsedResume(contentAfterResume.trim());
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      alert('优化过程中出现异常：' + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // 生成展示在富文本区的格式化函数
  const renderResumeToHtml = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      
      // 简单处理加粗记号 **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="text-primary font-bold bg-primary/10 px-1 rounded">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* 左侧栏：工具栏 + 简历预览区 (60%) */}
      <div className="flex flex-col w-[60%] border-r h-full relative z-10 box-border">
        <Toolbar 
          onExportPdf={() => exportToPdf('resume-a4-preview')}
          onExportWord={() => {
            const el = document.getElementById('resume-content-editable');
            if (el) {
              exportToWord(el.innerHTML);
            } else {
              alert('未找到可导出的简历内容');
            }
          }}
        />
        <div className="flex-1 bg-muted/20 p-8 overflow-y-auto overflow-x-hidden flex justify-center items-start pb-20">
          {/* A4纸容器 */}
          <div id="resume-a4-preview" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] h-fit ring-1 ring-black/5 flex flex-col pt-8 pb-12 px-10 relative">
            {/* 我们移除了 shadow-xl 因为其在 html2pdf 中可能渲染异常，改用外部 border / ring */}
            {!parsedResume && !isParsingPdf ? (
              <div className="flex flex-col h-full flex-1 items-center justify-center text-center px-4">
                <div className="mb-8 space-y-3">
                  <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600">
                    AI 简历智能优化助手
                  </h1>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    自动提炼亮点、精准匹配 JD、一键导出超高清 PDF 与分层 Word
                  </p>
                </div>
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-100 p-2">
                  <ResumeUploader 
                    onParsed={handleParsed}
                    onParsingStart={handleParsingStart}
                    onParsingError={handleParsingError}
                  />
                </div>
              </div>
            ) : isParsingPdf ? (
              <div className="flex flex-col items-center justify-center h-full flex-1 text-gray-500 space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <p>正在努力解析 PDF 中...</p>
              </div>
            ) : (
              <div 
                id="resume-content-editable"
                className={`w-full h-full outline-none text-gray-800 leading-relaxed font-sans text-sm ${isOptimizing ? 'opacity-70 transition-opacity' : ''}`}
                contentEditable={!isOptimizing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  // 为了避免在 React 内渲染与 contentEditable 的 DOM 冲突
                  // 如果不是在优化过程中，我们尝试反向同步纯文本
                  if (!isOptimizing) {
                    setParsedResume(e.currentTarget.innerText);
                  }
                }}
              >
                {renderResumeToHtml(parsedResume)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧栏：JD 输入 + AI 日志区 (40%) */}
      <div className="flex flex-col w-[40%] h-full bg-slate-50 border-l relative z-20">
        <div className="flex-none h-1/2 border-b overflow-y-auto">
          <JdPanel 
            jdText={jdText}
            onChange={setJdText}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            baseUrl={baseUrl}
            onBaseUrlChange={setBaseUrl}
            onOptimize={handleOptimize}
            isLoading={isOptimizing}
            canOptimize={!!parsedResume && !!jdText && !!apiKey && !!baseUrl}
          />
        </div>
        <div className="flex-1 h-1/2 overflow-hidden bg-white">
          <AiLogPanel logs={logs} isStreaming={isOptimizing} />
        </div>
      </div>
    </div>
  );
}
