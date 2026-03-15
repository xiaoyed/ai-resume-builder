export async function extractTextFromPdf(file: File): Promise<string> {
  // 动态导入 pdfjs-dist，避免 Next.js SSR 报错
  const pdfjsLib = await import('pdfjs-dist');

  // 使用 Next.js 推荐的本地 worker 加载方式，避免跨域或 Turbopack 下的动态 fetch 问题
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
          throw new Error('无法读取文件内容');
        }

        const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
        const pdfDoc = await loadingTask.promise;

        const numPages = pdfDoc.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          
          // @ts-ignore
          const pageText = textContent.items
            // @ts-ignore
            .map((item) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        }

        resolve(fullText.trim());
      } catch (error) {
        console.error('PDF 解析失败:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}
