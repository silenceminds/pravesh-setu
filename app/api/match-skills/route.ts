import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

// Enterprise configuration: Extend Vercel serverless timeout to 60 seconds
export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Enterprise Retry Wrapper with Exponential Backoff
 * Prevents intermittent 500 errors from transient AI rate limits or network blips.
 */
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
      console.warn(`[Skill-Grid AI Attempt ${attempt}/${retries}] Failed:`, error.message);
      if (attempt === retries) throw error;
      await new Promise((res) => setTimeout(res, delay * attempt));
    }
  }
  throw new Error('All enterprise retry attempts exhausted for skill matching.');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateName, projectSummary } = body;

    // 1. Rigorous Input Validation
    if (!candidateName || typeof candidateName !== 'string' || !projectSummary || typeof projectSummary !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing candidateName and projectSummary parameters.' },
        { status: 400 }
      );
    }

    const prompt = `
      You are the Skill-Grid AI Matchmaker. 
      Analyze this student engineering project submission:
      "${projectSummary.trim()}"

      1. Extract 3-4 verified practical competencies.
      2. Identify 2 real-world regional industry or MSME roles that directly need these competencies.
      
      Return ONLY valid JSON with this exact structure:
      {
        "competencies": ["Competency 1", "Competency 2", "Competency 3"],
        "industryMatches": [
          {
            "sector": "e.g., Agri-Tech / Embedded Systems / Local Gov Ops",
            "role": "e.g., Automation Associate",
            "relevanceScore": "92%",
            "suggestedNextModule": "Next micro-credential to bridge remaining gap"
          }
        ]
      }
    `;

    // 2. Resilient AI Generation with Retry
    const rawText = await generateWithRetry(prompt);

    // Sanitize output (remove potential markdown wrappers if present)
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError: any) {
      console.error('[JSON Parse Error - Skill Grid]:', cleanedText);
      return NextResponse.json(
        { success: false, error: 'Failed to parse structured skill passport schema from AI output.' },
        { status: 502 }
      );
    }

    if (!parsedData.competencies || !Array.isArray(parsedData.competencies) || !parsedData.industryMatches || !Array.isArray(parsedData.industryMatches)) {
      throw new Error('AI response structure violated the required skill passport schema.');
    }

    // 3. Database Persistence with Enterprise Error Handling
    const { data: record, error: dbError } = await supabase
      .from('skill_passports')
      .insert({
        candidate_name: candidateName.trim(),
        project_summary: projectSummary.trim(),
        verified_competencies: parsedData.competencies,
        industry_matches: parsedData.industryMatches,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Supabase Skill Passport Persistence Error]:', dbError);
      return NextResponse.json(
        { success: false, error: `Database persistence failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      passport: record,
    });

  } catch (error: any) {
    console.error('[Enterprise Skill-Grid Route Critical Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server skill matching error.' },
      { status: 500 }
    );
  }
}
