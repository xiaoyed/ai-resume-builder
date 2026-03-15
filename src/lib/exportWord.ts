export async function exportToWord(htmlContent: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);
  
  // 提取带换行的纯文本：必须挂载在 DOM 树上，浏览器才会解析区块带来的物理换行 (\n)
  const textContent = tempDiv.innerText || '';
  document.body.removeChild(tempDiv);
  
  // 保留空行，用于控制间距
  const lines = textContent.split('\n');

  const children: any[] = [];

  // 判断当前是在哪个部分，以做基本的格式缩进或加粗处理
  for (let line of lines) {
    let cleanLine = line.trim();
    let textRuns = [];

    // 如果是一行纯空白行，我们在 Word 里塞入一个极小的空白段落作为间距
    if (cleanLine.length === 0) {
      children.push(
        new Paragraph({
          children: [],
          spacing: { before: 100, after: 100 }
        })
      );
      continue;
    }

    // 处理加粗 **...** 
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIdx = 0;
    let match;

    while ((match = boldRegex.exec(cleanLine)) !== null) {
      if (match.index > lastIdx) {
        textRuns.push(new TextRun({ text: cleanLine.substring(lastIdx, match.index), size: 22 })); // 11pt
      }
      textRuns.push(new TextRun({ text: match[1], bold: true, size: 22 })); // 加粗
      lastIdx = boldRegex.lastIndex;
    }
    if (lastIdx < cleanLine.length) {
      textRuns.push(new TextRun({ text: cleanLine.substring(lastIdx), size: 22 }));
    }

    if (textRuns.length === 0) {
      textRuns.push(new TextRun({ text: cleanLine, size: 22 }));
    }

    // 简单启发式判断：如果没有句号等长句特征，或者是明确的大写/分类如“教育背景”，将其作为 Heading2 加特殊颜色
    const isHeading = 
       (cleanLine.startsWith('# ') || cleanLine.startsWith('## ') || cleanLine.startsWith('### ')) ||
       (!cleanLine.includes('，') && !cleanLine.includes('。') && cleanLine.length < 30 && cleanLine.includes(' / '));

    if (cleanLine.startsWith('# ')) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: cleanLine.replace(/^#\s*/, ''), size: 36, bold: true })],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 300 } // 增加一级标题间距
        })
      );
    } else if (cleanLine.startsWith('## ') || cleanLine.startsWith('### ') || isHeading) {
      const titleText = cleanLine.replace(/^#+\s*/, '');
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: titleText, size: 28, bold: true, color: '1A5276' })
          ], 
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }, // 显著增加各个大类之间的距离
          border: { bottom: { color: '1A5276', space: 1, size: 12, style: 'single' } }
        })
      );
    } 
    // 判断如果是简历开头常见的姓名，用大字号居中
    else if (cleanLine.length < 10 && !cleanLine.includes('：') && !cleanLine.includes(':') && !cleanLine.includes('|') && children.length < 3) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: cleanLine, size: 48, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );
    } 
    // 判断如果是列表项
    else if (cleanLine.startsWith('- ') || cleanLine.startsWith('• ') || cleanLine.startsWith('· ')) {
       // 我们需要基于去除前缀的干净行重新生成 textRuns
       const bulletCleanLine = cleanLine.replace(/^[-•·]\s*/, '');
       let bulletRuns = [];
       let lastSubIdx = 0;
       let subMatch;
       // 重新跑一遍加粗正则
       boldRegex.lastIndex = 0;
       while ((subMatch = boldRegex.exec(bulletCleanLine)) !== null) {
         if (subMatch.index > lastSubIdx) {
           bulletRuns.push(new TextRun({ text: bulletCleanLine.substring(lastSubIdx, subMatch.index), size: 22 }));
         }
         bulletRuns.push(new TextRun({ text: subMatch[1], bold: true, size: 22 }));
         lastSubIdx = boldRegex.lastIndex;
       }
       if (lastSubIdx < bulletCleanLine.length) {
         bulletRuns.push(new TextRun({ text: bulletCleanLine.substring(lastSubIdx), size: 22 }));
       }
       if (bulletRuns.length === 0) {
         bulletRuns.push(new TextRun({ text: bulletCleanLine, size: 22 }));
       }

       children.push(
         new Paragraph({
           children: bulletRuns,
           bullet: { level: 0 },
           spacing: { after: 100 }
         })
       );
    } else {
      children.push(
        new Paragraph({
          children: textRuns,
          spacing: { before: 80, after: 160 } // 进一步增加正文的上下间距避免拥挤
        })
      );
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
         page: { 
           // 设置标准的 Word 页边距 (A4 页面通常是 1inch = 1440 缇(twips))
           margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } 
         }
      },
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '优化后简历.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
