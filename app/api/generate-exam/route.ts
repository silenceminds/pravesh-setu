import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { subject, topic, variantId } = await req.json();

    const prompt = `
      Act as an advanced exam synthesis engine for ${subject}, specifically topic: "${topic}".
      Synthesize an exam variant (Variant Seed: ${variantId || Date.now()}).
      Generate 3 highly conceptual questions testing core fundamentals rather than rote recall.
      
      CRITICAL FORMATTING INSTRUCTION: You MUST use strict LaTeX formatting for all mathematical equations, variables, physical constants, and symbols. 
      - Wrap inline math in single $ signs (e.g., $F = ma$, $\\omega$).
      - Wrap block equations in double $$ signs.
      
      Return ONLY valid JSON with this structure:
      {
        "variantId": "${variantId}",
        "questions": [
          {
            "id": 1,
            "problem": "Detailed question text utilizing LaTeX for math",
            "concept_tested": "Specific concept",
            "difficulty": "Moderate | High"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Cryptographic hash acting as the tamper-evident digital seal
    const paperPayloadString = JSON.stringify(parsedData.questions);
    const paperHash = crypto.createHash('sha256').update(paperPayloadString).digest('hex');

    // Store the node log in Supabase
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

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      paperHash,
      questions: parsedData.questions,
      nodeId: dbEntry.id,
      timestamp: dbEntry.seed_timestamp,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}