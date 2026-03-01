import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Tells Next.js to allow this route to run longer without timing out
export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { context, sourceType, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please connect GitHub." }, { status: 401 });
    }

    // 1. Fetch the User's Dynamic Persona
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('persona_voice')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) console.warn("Supabase Warning:", profileError);

    const personaVoice = profile?.persona_voice || "You are a professional content architect.";

    // 2. The Smart Web Scraper
    let finalContext = context;
    if (sourceType === 'url') {
      // Impersonate a real browser to bypass basic bot protection
      const urlResponse = await fetch(context, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
      });
      
      if (!urlResponse.ok) throw new Error("Target website blocked the request.");
      
      const rawHtml = await urlResponse.text();
      
      // Strip out scripts, styles, and HTML tags to prevent timeouts
      finalContext = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' '); 
    }

    // 3. Orchestrate with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction: personaVoice 
    });

    // 4. Chain-of-Thought Prompt Enforcement
    const prompt = `
      TASK: Analyze the provided ${sourceType === 'url' ? 'scraped webpage text' : 'raw notes/drafts'}.
      Architect a 3-day social media distribution strategy. 
      
      CRITICAL: If the persona dictates a specific sign-off, tone, or phrase, you MUST include it in the generated text for every single post.

      SOURCE CONTEXT:
      ${finalContext}

      OUTPUT RULES:
      Return ONLY a valid JSON object. Do not include markdown formatting.
      You must include a "rule_check" field explicitly stating the exact sign-off or stylistic rule requested in the persona to prove you read it.
      
      Format: 
      {
        "rule_check": "I will end every post with the exact phrase: ...",
        "campaign": [
          {"day": 1, "x": "...", "linkedin": "...", "discord": "..."}
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outputText = response.text();

    return NextResponse.json({ output: outputText });

  } catch (error: any) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}