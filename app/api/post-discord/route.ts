import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { content, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // 1. Securely fetch the user's specific webhook from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('discord_webhook')
      .eq('user_id', userId)
      .single();

    if (error || !profile?.discord_webhook) {
      return NextResponse.json({ error: "No Discord webhook configured. Please update your Identity Settings." }, { status: 400 });
    }

    // 2. Transmit to the user's Discord server
    const response = await fetch(profile.discord_webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error("Discord rejected the payload.");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Discord Post Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}