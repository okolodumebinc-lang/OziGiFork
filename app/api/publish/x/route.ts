import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, userId } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !userId) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 }
      );
    }

    // 1. Initialize Supabase using the user's secure token so we can query their saved data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2. Fetch their X Access Token from the database
    const { data: tokenData, error: tokenError } = await supabase
      .from("user_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .in("provider", ["twitter", "x"]) // Supabase sometimes saves it as 'twitter' internally
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "X account not connected. Please sign in with X again." },
        { status: 401 }
      );
    }

    const xAccessToken = tokenData.access_token;

    // 3. Thread Logic: Split the text by double newlines
    // If it's a single tweet, this just creates an array of 1.
    const tweets = text.split("\n\n").filter((t: string) => t.trim() !== "");

    let previousTweetId: string | null = null;

    // 4. Loop through and post them. If there is a previous ID, make it a thread.
    for (const tweetContent of tweets) {
      const payload: any = { text: tweetContent };

      // If we already posted a tweet in this loop, thread this one to it!
      if (previousTweetId) {
        payload.reply = { in_reply_to_tweet_id: previousTweetId };
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${xAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Twitter API rejected the tweet.");
      }

      // Save the ID so the next tweet knows what to reply to
      previousTweetId = result.data.id;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("X Publish API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
