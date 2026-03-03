"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { CampaignDay } from "../lib/types";
import Hero from "../components/Hero";
import Distillery from "../components/ContextEngine";
import DistributionGrid from "../components/DistributionGrid";
import UpgradeBanner from "../components/GuestModeBanner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [loading, setLoading] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [inputs, setInputs] = useState<{
    url: string;
    text: string;
    file: File | null;
    tweetFormat: "single" | "thread";
  }>({
    url: "",
    text: "",
    file: null,
    tweetFormat: "single",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // 1. Restore saved view
    const savedView = localStorage.getItem("writerhelper_view") as
      | "landing"
      | "dashboard";
    if (savedView) setView(savedView);

    // 🚨 NEW: URL ERROR CATCHER & CLEANER 🚨
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc =
      hashParams.get("error_description") ||
      searchParams.get("error_description");

    if (errorDesc) {
      // Decode the URL text (turns "+" into spaces) and set it to your error banner
      setErrorMessage(decodeURIComponent(errorDesc).replace(/\+/g, " "));
      // Instantly wipe the ugly error from the browser URL bar
      window.history.replaceState(null, "", window.location.pathname);
    }

    // 2. Handle Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchHistory(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        fetchHistory(session.user.id);

        // 🚨 THE TOKEN CATCHER 🚨
        if (session.provider_token) {
          const provider = session.user.app_metadata.provider;
          const { error } = await supabase.from("user_tokens").upsert(
            {
              user_id: session.user.id,
              provider: provider,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id, provider" }
          );

          if (error) console.error("Failed to save provider token:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetView = (newView: "landing" | "dashboard") => {
    setView(newView);
    localStorage.setItem("writerhelper_view", newView);
  };

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPastCampaigns(data);
  };

  const restoreCampaign = (record: any) => {
    setInputs({
      url: record.source_url || "",
      text: record.source_notes || "",
      file: null,
      tweetFormat: "single", // Fallback for old campaigns
    });
    setCampaign(record.generated_content);
    setIsHistoryOpen(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. We must use FormData to send physical files over HTTP
      const formData = new FormData();
      if (inputs.url) formData.append("urlContext", inputs.url);
      if (inputs.text) formData.append("textContext", inputs.text);
      if (inputs.file) formData.append("file", inputs.file);
      formData.append("tweetFormat", inputs.tweetFormat);
      formData.append("personaVoice", "Expert Content Strategist");

      // 2. Do NOT set the 'Content-Type' header.
      // The browser automatically sets the correct multi-part boundary for FormData!
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(
          data.error ||
            "Failed to generate campaign. The site might be blocking bots."
        );
        setLoading(false);
        return;
      }

      const cleanJson = data.output
        .replace(/```json/gi, "")
        .replace(/```/gi, "");
      const finalCampaign = JSON.parse(cleanJson);

      if (finalCampaign.campaign) {
        setCampaign(finalCampaign.campaign);
        setTimeout(() => {
          campaignRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
        if (session?.user) {
          await supabase.from("campaigns").insert({
            user_id: session.user.id,
            source_url: inputs.url,
            source_notes: inputs.text,
            generated_content: finalCampaign.campaign,
          });
          fetchHistory(session.user.id);
        }
      }
    } catch (err) {
      console.error("Context error:", err);
      setErrorMessage(
        "A syntax error occurred while parsing the AI response. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900">
      <Header
        session={session}
        view={view}
        setView={handleSetView}
        onSignIn={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border-4 border-slate-900 relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">
              Strategy History
            </h2>
            <div className="overflow-y-auto space-y-4">
              {pastCampaigns.map((record) => (
                <div
                  key={record.id}
                  className="border border-slate-200 p-4 rounded-xl flex justify-between items-center group hover:bg-red-50/20"
                >
                  <div className="truncate pr-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {record.source_url || "Custom Text Strategy"}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreCampaign(record)}
                    className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="pt-28 md:pt-32 pb-8">
        {view === "landing" ? (
          <Hero onStart={() => handleSetView("dashboard")} />
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full pt-4 md:pt-8">
            {!session && (
              <UpgradeBanner onSignIn={() => setIsAuthModalOpen(true)} />
            )}
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-12">
              Context Engine
            </h2>

            {/* ⚠️ ERROR BANNER INJECTED HERE */}
            {errorMessage && (
              <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                <span className="text-lg">⚠️</span>
                {errorMessage}
              </div>
            )}

            <Distillery
              inputs={inputs}
              setInputs={setInputs}
              onGenerate={handleGenerate}
              loading={loading}
            />

            {/* ✨ NEW: Pulsing Loading State */}
            {loading && (
              <div className="mt-16 space-y-8 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-100 rounded-[2rem] h-96 border-2 border-slate-200"
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* ✨ The Auto-Scrolling Grid */}
            {campaign.length > 0 && !loading && (
              <div className="mt-16 scroll-mt-32" ref={campaignRef}>
                <DistributionGrid campaign={campaign} session={session} />
              </div>
            )}
          </div>
        )}
        {/* Render Auth Modal at the top level */}
        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </main>
      <Footer />
    </div>
  );
}
