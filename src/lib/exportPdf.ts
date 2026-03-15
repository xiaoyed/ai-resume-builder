export async function exportToPdf(elementId: string, filename: string = '优化后简历.pdf') {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) return;

  // 使用独立的隐藏 IFrame 进行打印，能 100% 隔离外部多余的 Next.js flex 高度限制
  // 从而实现完美原生的多页自然截断打印
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  const headElements = document.head.innerHTML;
  
  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        ${headElements}
        <title>${filename.replace('.pdf', '')}</title>
        <style>
          /* 核心打印重置样式 */
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
            overflow: visible !important;
          }
          @page {
            margin: 10mm; /* 设置标准留白边距 */
            size: a4 portrait;
          }
          #${elementId} {
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            position: static !important;
          }
          /* 防止在页首/段落内部不美观地截断 */
          h1, h2, h3, p, li {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `;

  doc.open();
  doc.write(printHtml);
  doc.close();

  // 延迟一秒给浏览器内部加载 CSS 与图标字体留足时间
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error(e);
    } finally {
      // 延时移除以防拦截了 Print 弹窗生命周期
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }
  }, 1000);
}
