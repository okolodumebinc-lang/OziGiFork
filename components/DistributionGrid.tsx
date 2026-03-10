"use client";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { CampaignDay } from "../lib/types";

// --- Framer Motion Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// 1. Expandable Text Component
function ExpandableText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > 250;

  return (
    <div className="flex-1 flex flex-col mb-4">
      <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap flex-1 leading-relaxed">
        {isExpanded || !isLong ? text : `${text.slice(0, 250)}...`}
      </p>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-red-900 transition-colors self-start"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

// 2. Universal Social Card Component
function SocialCard({
  day,
  platformName,
  initialText,
  onPost,
  postStatus,
  actionButtonConfig,
}: {
  day: number;
  platformName: string;
  initialText: string;
  onPost?: (text: string, day: number, imageUrl?: string) => void;
  postStatus?: "idle" | "loading" | "success" | "error";
  actionButtonConfig?: {
    idle: string;
    loading: string;
    success: string;
    classes: string;
  };
}) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imageTitle, setImageTitle] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          platform: platformName,
          graphicTitle: imageTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      alert(`Image Error: ${err.message}`);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ozigi-campaign-day-${day}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    // 🔥 TIGHTENED: Reduced border width, sharpended corners, reduced padding (p-5 instead of p-6)
    <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col p-5 hover:border-slate-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-widest text-slate-900">
          Day {day}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={handleCopy}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Optional: Text overlay for graphic"
          value={imageTitle}
          onChange={(e) => setImageTitle(e.target.value)}
          className="w-full text-[10px] font-bold tracking-wide text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-400 transition-colors placeholder:font-medium placeholder:text-slate-400"
        />
      </div>
      
      {imageUrl ? (
        <div className="mb-5 flex flex-col gap-2 relative z-10">
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={imageUrl}
              alt="Generated graphic"
              className="w-full h-auto object-cover aspect-video"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImg}
                className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors shadow-lg"
              >
                {isGeneratingImg ? "Generating..." : "Regenerate"}
              </button>
            </div>
          </div>
          <button
            onClick={handleDownloadImage}
            type="button"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            ⬇️ Download
          </button>
        </div>
      ) : (
        <button
          onClick={handleGenerateImage}
          disabled={isGeneratingImg}
          className="w-full mb-5 py-3 border border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          {isGeneratingImg ? "🎨 Painting pixels..." : "🎨 Generate Graphic"}
        </button>
      )}

      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 min-h-[150px] resize-y focus:outline-none focus:border-red-400"
        />
      ) : (
        <ExpandableText text={text} />
      )}

      {onPost && actionButtonConfig && (
        <button
          onClick={() => onPost(text, day, imageUrl || undefined)}
          disabled={postStatus === "loading" || postStatus === "success"}
          className={`w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mt-auto ${
            postStatus === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : actionButtonConfig.classes
          }`}
        >
          {postStatus === "loading" && actionButtonConfig.loading}
          {postStatus === "success" && actionButtonConfig.success}
          {postStatus !== "loading" &&
            postStatus !== "success" &&
            actionButtonConfig.idle}
        </button>
      )}
    </motion.div>
  );
}

// 3. Main Grid Component
export default function DistributionGrid({
  campaign,
  session,
}: {
  campaign: CampaignDay[];
  session: any;
}) {
  const [xStatuses, setXStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [discordStatuses, setDiscordStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [liStatuses, setLiStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});

  const handlePostToX = async (text: string, day: number) => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
    setXStatuses((prev) => ({ ...prev, [day]: "success" }));
    setTimeout(() => setXStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
  };

  const handlePostToDiscord = async (text: string, day: number) => {
    const webhookUrl = session?.user?.user_metadata?.discord_webhook;
    if (!webhookUrl) {
      alert("No Discord Webhook found. Please add one in Settings ⚙️");
      return;
    }
    setDiscordStatuses((prev) => ({ ...prev, [day]: "loading" }));
    try {
      const res = await fetch("/api/post-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, webhookUrl }),
      });
      if (!res.ok) throw new Error("Discord rejected the webhook payload.");
      setDiscordStatuses((prev) => ({ ...prev, [day]: "success" }));
      setTimeout(() => setDiscordStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
    } catch (error: any) {
      console.error("Discord Error:", error);
      setDiscordStatuses((prev) => ({ ...prev, [day]: "error" }));
      alert(`Failed to post to Discord: ${error.message}`);
    }
  };

  const handlePostToLinkedIn = async (text: string, day: number, imageUrl?: string) => {
    if (!session?.access_token) return alert("You must be signed in to post!");
    setLiStatuses((prev) => ({ ...prev, [day]: "loading" }));
    try {
      const res = await fetch("/api/publish/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, userId: session.user.id, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post to LinkedIn");
      setLiStatuses((prev) => ({ ...prev, [day]: "success" }));
      setTimeout(() => setLiStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
    } catch (error: any) {
      console.error("LinkedIn Posting Error:", error);
      setLiStatuses((prev) => ({ ...prev, [day]: "error" }));
      alert(`Failed to post: ${error.message}`);
    }
  };

  const hasX = campaign.some((d) => d.x);
  const hasLinkedIn = campaign.some((d) => d.linkedin);
  const hasDiscord = campaign.some((d) => d.discord);

  return (
    <motion.div 
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* X ROW */}
      {hasX && (
        <section>
          {/* ... existing header ... */}
          {/* 🔥 Goal 2: Added "items-start" to prevent cards from stretching vertically */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* ... mapped cards ... */}
          </div>
        </section>
      )}

      {/* LINKEDIN ROW */}
      {hasLinkedIn && (
        <section>
          {/* ... existing header ... */}
          {/* 🔥 Goal 2: Added "items-start" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* ... mapped cards ... */}
          </div>
        </section>
      )}

      {/* DISCORD ROW */}
      {hasDiscord && (
        <section>
          {/* ... existing header ... */}
          {/* 🔥 Goal 2: Added "items-start" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* ... mapped cards ... */}
          </div>
        </section>
      )}

      {/* 🔥 Goal 4: The Upcoming Platforms Announcement */}
      <motion.section variants={fadeUp} className="mt-20 border-t border-dashed border-slate-200 pt-16">
         <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
            {/* Aesthetic background blur */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-200/50 blur-3xl rounded-full pointer-events-none group-hover:bg-slate-300/50 transition-colors duration-500"></div>
            
            <div className="relative z-10 flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pipeline Expansion</span>
               </div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-3">
                  Visual Platforms Incoming.
               </h3>
               <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
                  The engine is expanding. We are currently architecting the routing logic for <span className="text-slate-900 font-bold">TikTok</span> scripts, <span className="text-slate-900 font-bold">Instagram</span> captions, and <span className="text-slate-900 font-bold">YouTube</span> descriptions. 
               </p>
            </div>
            
            <div className="relative z-10 flex gap-4 shrink-0">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl opacity-50 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100 group-hover:-translate-y-1">📱</div>
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl opacity-50 grayscale transition-all delay-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:-translate-y-1">📸</div>
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl opacity-50 grayscale transition-all delay-150 group-hover:grayscale-0 group-hover:opacity-100 group-hover:-translate-y-1">▶️</div>
            </div>
         </div>
      </motion.section>

    </motion.div>
  );
}