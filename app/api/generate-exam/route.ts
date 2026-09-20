import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function generateWithRetry(prompt: string, retries = 3, delay = 1000): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response payload received from Gemini model.');
      return text;
    } catch (error: any) {
      console.warn(`[Gemini Synthesis Attempt ${attempt}/${retries}] Failed:`, error.message);
      if (attempt === retries) throw error;
      await new Promise((res) => setTimeout(res, delay * attempt));
    }
  }
  throw new Error('All enterprise retry attempts exhausted for AI synthesis.');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, topic, variantId } = body;

    if (!subject || typeof subject !== 'string' || !topic || typeof topic !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing subject and topic parameters.' },
        { status: 400 }
      );
    }

    const resolvedVariantId = variantId || `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const prompt = `
      Act as an advanced enterprise exam synthesis engine for ${subject}, specifically topic: "${topic}".
      Synthesize an exam variant (Variant Seed: ${resolvedVariantId}).
      Generate exactly 3 highly conceptual questions testing core fundamentals rather than rote recall.
      
      CRITICAL FORMATTING & JSON ESCAPING RULES:
      1. You MUST use strict LaTeX formatting for all mathematical equations, variables, physical constants, and symbols. 
      2. Wrap inline math in single $ signs (e.g., $F = ma$, $\\omega$).
      3. CRITICAL JSON RULE: Because this output is parsed as strict JSON, you MUST double-escape all LaTeX backslashes (e.g., use "\\\\frac", "\\\\tau", "\\\\theta", "\\\\omega", "\\\\vec") so that control characters like \\t or \\n do not break JSON parsing.
      
      Return ONLY valid JSON with this exact structure:
      {
        "variantId": "${resolvedVariantId}",
        "questions": [
          {
            "id": 1,
            "problem": "Detailed question text utilizing properly escaped LaTeX for math",
            "concept_tested": "Specific concept",
            "difficulty": "Moderate | High"
          }
        ]
      }
    `;

    const rawText = await generateWithRetry(prompt);
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError: any) {
      console.error('[JSON Parse Error]:', parseError.message);
      console.error('[Raw AI Text Output]:', cleanedText);
      return NextResponse.json(
        { success: false, error: 'Failed to parse structured exam schema due to LaTeX escape collision.' },
        { status: 502 }
      );
    }

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error('AI response structure violated the required question schema.');
    }

    const paperPayloadString = JSON.stringify(parsedData.questions);
    const paperHash = crypto.createHash('sha256').update(paperPayloadString).digest('hex');

    const { data: dbEntry, error: dbError } = await supabase
      .from('exam_nodes')
      .insert({
        subject,
        topic,
        paper_hash: paperHash,
        generated_questions: parsedData.questions,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Supabase Persistence Error]:', dbError);
      return NextResponse.json(
        { success: false, error: `Database persistence failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paperHash,
      questions: parsedData.questions,
      nodeId: dbEntry?.id || null,
      timestamp: dbEntry?.seed_timestamp || new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Enterprise Exam Route Critical Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server synthesis error.' },
      { status: 500 }
    );
  }
}
