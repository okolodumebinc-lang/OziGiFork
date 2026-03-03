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

    // 1. Initialize Supabase securely
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2. Fetch the LinkedIn Access Token from the database
    // Note: Supabase uses 'linkedin_oidc' for modern LinkedIn connections
    const { data: tokenData, error: tokenError } = await supabase
      .from("user_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .eq("provider", "linkedin_oidc")
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        {
          error:
            "LinkedIn account not connected. Please sign in with LinkedIn.",
        },
        { status: 401 }
      );
    }

    const liAccessToken = tokenData.access_token;

    // 3. Get the user's LinkedIn ID (URN)
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${liAccessToken}` },
    });
    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      throw new Error("Failed to fetch LinkedIn profile to authorize post.");
    }

    // LinkedIn's OIDC endpoint returns the user's ID as 'sub'
    const authorUrn = `urn:li:person:${profileData.sub}`;

    // 4. Publish the actual post to the LinkedIn Feed
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${liAccessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: text },
            shareMediaCategory: "NONE", // 'NONE' means text-only post
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    const postData = await postRes.json();

    if (!postRes.ok) {
      throw new Error(postData.message || "LinkedIn API rejected the post.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LinkedIn Publish API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
