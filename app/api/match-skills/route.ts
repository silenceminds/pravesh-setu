import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { candidateName, projectSummary } = await req.json();

    const prompt = `
      You are the Skill-Grid AI Matchmaker. 
      Analyze this student engineering project submission:
      "${projectSummary}"

      1. Extract 3-4 verified practical competencies.
      2. Identify 2 real-world regional industry or MSME roles that directly need these competencies.
      
      Return ONLY valid JSON:
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    const { data: record, error: dbError } = await supabase
      .from('skill_passports')
      .insert({
        candidate_name: candidateName,
        project_summary: projectSummary,
        verified_competencies: parsedData.competencies,
        industry_matches: parsedData.industryMatches,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      passport: record,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}