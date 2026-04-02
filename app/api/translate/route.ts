import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';

const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || '';
const VOLCANO_ENDPOINT = process.env.VOLCANO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/responses';
const VOLCANO_MODEL_ID = process.env.VOLCANO_MODEL_ID || 'glm-4-7-251222';

interface TranslateRequest {
  texts: {
    zh?: string;
    en?: string;
    ja?: string;
  };
  fieldName: string; // 字段名称，用于提示
}

interface VolcanoOutputItem {
  id: string;
  type: string;
  content?: Array<{ type: string; text: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TranslateRequest = await request.json();
    const { texts, fieldName } = body;

    console.log('=== Translation Request Debug ===');
    console.log('API Key exists:', !!VOLCANO_API_KEY);
    console.log('API Key length:', VOLCANO_API_KEY.length);
    console.log('API Key preview:', VOLCANO_API_KEY.substring(0, 10) + '...');
    console.log('Endpoint:', VOLCANO_ENDPOINT);
    console.log('Model ID:', VOLCANO_MODEL_ID);
    console.log('Request body:', { texts, fieldName });
    console.log('================================');

    if (!VOLCANO_API_KEY) {
      console.error('VOLCANO_API_KEY is not set!');
      return NextResponse.json(
        { error: '翻译服务配置错误：API Key 未设置', debug: 'VOLCANO_API_KEY is empty' },
        { status: 500 }
      );
    }

    // 检测已填写的语言
    const filledLanguages: string[] = [];
    const filledTexts: { [key: string]: string } = {};

    if (texts.zh?.trim()) {
      filledLanguages.push('中文');
      filledTexts.zh = texts.zh.trim();
    }
    if (texts.en?.trim()) {
      filledLanguages.push('英文');
      filledTexts.en = texts.en.trim();
    }
    if (texts.ja?.trim()) {
      filledLanguages.push('日文');
      filledTexts.ja = texts.ja.trim();
    }

    if (filledLanguages.length === 0) {
      return NextResponse.json(
        { error: '请至少填写一个语言的内容' },
        { status: 400 }
      );
    }

    // 构建翻译提示词
    const sourceText = Object.values(filledTexts).join('\n');
    const needTranslate: string[] = [];

    if (!texts.zh?.trim()) needTranslate.push('中文');
    if (!texts.en?.trim()) needTranslate.push('英文');
    if (!texts.ja?.trim()) needTranslate.push('日文');

    if (needTranslate.length === 0) {
      return NextResponse.json(
        { error: '所有语言都已填写，无需翻译' },
        { status: 400 }
      );
    }

    const prompt = `你是一个专业的学术翻译助手。请将以下${fieldName}翻译为${needTranslate.join('、')}。

已提供的内容（${filledLanguages.join('、')}）：
${sourceText}

要求：
1. 保持学术专业性和准确性
2. 如果是人名，请保持原文或使用标准译名
3. 如果是机构名称，请使用官方译名
4. 保持格式和标点符号的一致性
5. 直接返回翻译结果，不要添加任何解释
6. 请快速给出答案，不要进行过多的推理分析

请按以下JSON格式返回翻译结果：
{
  ${!texts.zh ? '"zh": "中文翻译",' : ''}
  ${!texts.en ? '"en": "English translation",' : ''}
  ${!texts.ja ? '"ja": "日本語翻訳"' : ''}
}`;

    // 调用火山引擎API
    const response = await fetch(VOLCANO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLCANO_API_KEY}`,
      },
      body: JSON.stringify({
        model: VOLCANO_MODEL_ID,
        stream: false,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: '你是一个高效的翻译助手。请直接给出翻译结果，不要进行推理分析。',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcano API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        {
          error: '翻译服务调用失败',
          details: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    console.log('Volcano API response:', JSON.stringify(data, null, 2));
    
    // 火山引擎API响应格式：找到 type 为 "message" 的输出项
    const messageOutput = data?.output?.find((item: VolcanoOutputItem) => item.type === 'message');
    const translatedText = messageOutput?.content?.[0]?.text;

    if (!translatedText) {
      console.error('Invalid response format:', data);
      return NextResponse.json(
        { error: '翻译结果为空', debug: JSON.stringify(data) },
        { status: 500 }
      );
    }

    console.log('Translated text:', translatedText);

    // 解析JSON结果
    try {
      // 提取JSON部分（可能包含在markdown代码块中）
      const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in translated text:', translatedText);
        throw new Error('无法解析翻译结果');
      }

      const translations = JSON.parse(jsonMatch[0]);
      console.log('Parsed translations:', translations);

      return NextResponse.json({
        success: true,
        translations,
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: '翻译结果解析失败', raw: translatedText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Translation error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '翻译失败，请稍后重试', details: errorMessage },
      { status: 500 }
    );
  }
}
