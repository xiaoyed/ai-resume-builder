'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/pdfParser';

interface ResumeUploaderProps {
  onParsed: (text: string) => void;
  onParsingStart?: () => void;
  onParsingError?: (err: Error) => void;
}

export function ResumeUploader({ onParsed, onParsingStart, onParsingError }: ResumeUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (onParsingStart) onParsingStart();

    try {
      const text = await extractTextFromPdf(file);
      onParsed(text);
    } catch (error: any) {
      if (onParsingError) onParsingError(error);
      else console.error(error);
    }
  }, [onParsed, onParsingStart, onParsingError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`h-[200px] w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-100'
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-10 h-10 text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-primary font-medium">释放以上传简历...</p>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 font-medium">点击或拖拽 PDF 简历文件到此区域</p>
          <p className="text-gray-400 text-sm mt-1">仅支持 .pdf 格式</p>
        </div>
      )}
    </div>
  );
}
