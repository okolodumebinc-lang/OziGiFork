import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { urlContext, textContext, personaVoice } = await req.json();

    let finalContext = "";

    // 1. Process URL if provided
    if (urlContext && urlContext.trim() !== "") {
      const urlResponse = await fetch(urlContext, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!urlResponse.ok)
        throw new Error("Target website blocked the request.");
      const rawHtml = await urlResponse.text();
      const scraped = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ");

      finalContext += `[SOURCE ARTICLE/URL CONTENT]\n${scraped}\n\n`;
    }

    // 2. Process Raw Notes if provided
    if (textContext && textContext.trim() !== "") {
      finalContext += `[ADDITIONAL USER NOTES/RAW TEXT]\n${textContext}\n\n`;
    }

    if (!finalContext.trim()) {
      return NextResponse.json(
        { error: "No context provided." },
        { status: 400 }
      );
    }

    // 3. Orchestrate with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction:
        personaVoice || "You are a professional content architect.",
    });

    const prompt = `
      TASK: Analyze the provided context (which may include a scraped webpage, raw user notes, or both).
      Architect a 3-day social media distribution strategy based on this information. 
      CRITICAL: If the persona dictates a specific sign-off, tone, or phrase, you MUST include it in the generated text for every single post.

      SOURCE CONTEXT:
      ${finalContext}

      OUTPUT RULES:
      Return ONLY a valid JSON object. Do not include markdown formatting.
      You must include a "rule_check" field explicitly stating the exact sign-off or stylistic rule requested in the persona.
      
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
