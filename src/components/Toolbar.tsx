import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download } from 'lucide-react';

interface ToolbarProps {
  onExportPdf?: () => void;
  onExportWord?: () => void;
}

export function Toolbar({ onExportPdf, onExportWord }: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b bg-muted/30 w-full z-20 sticky top-0">
      <Button variant="outline" className="flex items-center gap-2">
        <Upload className="w-4 h-4" />
        上传简历 (PDF)
      </Button>
      <div className="flex-1" />
      <Button variant="outline" className="flex items-center gap-2" onClick={onExportWord}>
        <FileText className="w-4 h-4" />
        导出 Word
      </Button>
      <Button className="flex items-center gap-2" onClick={onExportPdf}>
        <Download className="w-4 h-4" />
        导出 PDF
      </Button>
    </div>
  );
}
