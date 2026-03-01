import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { context, userId, sourceType } = await req.json();

    // 1. Fetch User Persona from Supabase
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("persona_voice")
      .eq("user_id", userId)
      .single();

    if (profileError) throw new Error("Could not load user persona.");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Dynamic Prompting based on User's Unique Voice
    const prompt = `
      You are an AI Content Architect. 
      USER PERSONA: ${profile.persona_voice}
      
      TASK: Analyze the following ${sourceType} and generate a 3-day social strategy.
      SOURCE CONTENT: ${context}

      Return ONLY JSON: {"campaign": [{"day": 1, "x": "...", "linkedin": "...", "discord": "..."}]}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ output: response.text() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
