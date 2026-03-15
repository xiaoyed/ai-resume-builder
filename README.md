# AI 驱动的简历智能解析与修改 Web 应用

![Resume Builder](./public/preview.png)

本项目是一个基于 Next.js (App Router) 构建的现代化「简历智能解析与优化」开源工具。它能够：
1. **解析 PDF**：在浏览器端纯本地解析上传的 PDF 简历提取文本。
2. **AI 智能改写**：根据用户输入的目标岗位要求 (JD)，通过大语言模型 (默认对接支持 OpenAI 格式的 API，如阿里云百炼大模型) 进行精准润色、重构与排版。
3. **沉浸式交互**：借助流式请求 (Streaming) 实现打字机般的思考输出和简历重构动画。
4. **一键导出**：支持所见即所得地原生地导出为**超高清矢量 PDF**，以及带有格式和层次排版的**分层 Word 文档 (.docx)**。

## 技术栈
- **核心框架**: Next.js 16 (React, TypeScript)
- **UI 组件库**: Tailwind CSS, shadcn/ui, Lucide Icons
- **PDF 解析**: pdfjs-dist
- **文档导出**: docx (Word), 原生 \`window.print\` 结合重置样式 (PDF)
- **AI 对接**: OpenAI Node.js SDK (完全脱离服务端环境变量，纯前端填入 Key)

## 零配置运行门槛极简设计
项目设计初衷是为了方便开发者零成本自部署或直接在本地启动。
**所有的 AI 模型参数配置均在页面 UI 的可视化侧边栏中完成**，您不再需要去编辑任何 `.env` 文件。

只需两项配置即可开始：
1. **API Key**: 你的大漠型鉴权密钥 (例如 \`sk-xxxxxx\`) 
2. **Base URL**: 你选择的大模型兼容服务端点 (例如 \`https://dashscope.aliyuncs.com/compatible-mode/v1\`)

## 本地部署指南

1. **克隆项目**
   \`\`\`bash
   git clone <your-repo-url>
   cd 个人简历优化助手
   \`\`\`

2. **安装依赖**
   \`\`\`bash
   npm install
   \`\`\`

3. **启动开发服务器**
   \`\`\`bash
   npm run dev
   \`\`\`
   之后在浏览器打开 \`http://localhost:3000\` 即可体验。

## 导出建议
- 导出 PDF：强烈推荐使用 Edge 或 Chrome 浏览器点击“导出 PDF”按钮。系统将自动屏蔽一切干扰元素，仅为您渲染 A4 的打印页面。
- 导出 Word：生成的 .docx 保留了文本加粗和基础的文档大类结构（一号/二号标题与下划线）。您可以在此基础上用普通版 Word 继续微调。

## 贡献与许可
随意分叉、提交 PR 加砖添瓦！

---
*Developed with love for job seekers & AI enthusiasts.*
