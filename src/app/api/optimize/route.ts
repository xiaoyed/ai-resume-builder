import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 移除全局的跨请求固定 openai 示例，以便每个请求能携带自己特定的 apiKey
// 我们将在处理请求时动态创建客户端

// 在 App Router 中，建议使用 Edge Runtime 处理流式响应，但在有 Node 特有依赖时可使用 nodejs。
// 此处我们使用默认 Node.js 环境，自己封装 ReadableStream 以支持流式返回前端。
export const maxDuration = 120; // 设定较长超时时间，防止生成长篇简历时 Vercel 或函数平台截断

export async function POST(req: Request) {
  try {
    const { resumeText, jdText, apiKey, baseUrl } = await req.json();

    if (!resumeText || !jdText) {
      return NextResponse.json({ error: '简历内容或 JD 内容缺失' }, { status: 400 });
    }

    if (!apiKey || !baseUrl) {
      return NextResponse.json({ error: '必须填写有效的 API Key 和 Base URL！' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl,
    });

    const systemPrompt = `你是一个资深的猎头、招聘专家和顶级简历写手。
你的目标是：根据用户提供的目标岗位描述 (JD)，非常巧妙地深度优化用户的简历。

【工作流程】
1. 分析 JD 中的核心关键词、技能要求、行业术语和软素质。
2. 逐一比对用户的简历，找到可以在真实经历基础上贴近这些 JD 要求的切入点。
3. 对简历进行重新排版或段落精简、扩写，尤其是经历部分，必须高亮或使用匹配 JD 的核心词汇。
4. 绝对不要凭空捏造经历，只能在原意上利用专业术语重塑和包装。

【输出格式强制要求】
为了让前端能动态解析你的思考过程和最终简历，你必须严格按以下格式输出，没有任何多余解释，不能输出 markdown 代码块的标记（如 \`\`\`xml）：
<log>你的第1条详细修改依据的思考（例如：将XXX修改为XXX以匹配JD中的[要求]）</log>
<log>你的第2条详细修改依据的思考...</log>
... (输出多条 log)
<resume>
完整的基于原始格式或更易读（建议分段落）的优化后最新简历文本。
可以在关键的技能词或匹配 JD 的点两侧使用 Markdown 加粗，如 **技能**，让用户看到重点。
</resume>`;

    const userPrompt = `【目标岗位 JD】\n${jdText}\n\n【原始简历】\n${resumeText}\n\n请开始执行思考和优化改写。`;

    const stream = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
    });

    // 转换 OpenAI stream 为 Web API ReadableStream
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('API /optimize Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
