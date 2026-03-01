"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Sub-Component: Social Post Card with Inline Editing ---
interface PostCardProps {
  platform: string;
  content: string;
  day: number;
}

const PostCard = ({ platform, content, day }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Logic for truncation
  const charLimit = 250;
  const isLong = editedContent.length > charLimit;
  const displayContent =
    isExpanded || isEditing
      ? editedContent
      : editedContent.substring(0, charLimit) + "...";

  const handlePost = async () => {
    if (platform.toLowerCase() !== "discord") {
      alert(
        `${platform} API integration required for auto-posting. Use Discord for now!`
      );
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/post-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        alert("✅ Successfully posted to Discord!");
      } else {
        throw new Error("Failed to post");
      }
    } catch (err) {
      alert("❌ Failed to post to Discord. Check your Webhook URL.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-center mb-3">
        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
          Day {day}
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-blue-600 text-xs font-semibold uppercase transition-colors flex items-center gap-1"
        >
          {isEditing ? "💾 Save" : "✏️ Edit"}
        </button>
      </div>

      <div className="mt-2 min-h-[100px]">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[180px] p-3 text-sm text-slate-700 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-mono leading-relaxed"
            placeholder="Edit your post content here..."
          />
        ) : (
          <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isEditing && isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 text-[11px] mt-3 font-bold hover:text-blue-800 uppercase tracking-tight flex items-center gap-1"
        >
          {isExpanded ? "↑ Show Less" : "↓ Read More"}
        </button>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
        <button
          onClick={handlePost}
          disabled={isPosting || isEditing}
          className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
        >
          {isPosting ? "Sending..." : `Push to ${platform}`}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(editedContent);
            alert("Copied to clipboard!");
          }}
          className="px-3 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
          title="Copy to clipboard"
        >
          📋
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [url, setUrl] = useState("");
  const [campaign, setCampaign] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCampaign = async () => {
    setLoading(true);
    setError("");
    setCampaign([]); // Reset for new generation

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ articleUrl: url }),
      });

      if (!res.ok) throw new Error("API Route failed");

      const data = await res.json();

      // Sanitizing the AI output string for JSON parsing
      const cleanJson = data.output.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.campaign) {
        setCampaign(parsed.campaign);
      } else {
        throw new Error("Invalid Campaign format");
      }
    } catch (err) {
      setError(
        "Failed to load campaign. Ensure your API returns valid JSON and your URL is correct."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 py-10 px-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
          Agentic Scheduler <span className="text-blue-600">v2</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto font-medium">
          Semi-autonomous distribution engine for technical content.
        </p>

        <div className="mt-8 max-w-2xl mx-auto flex gap-2 p-1 bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <input
            className="flex-1 bg-transparent px-5 py-3 outline-none text-slate-700 text-sm"
            placeholder="Paste dev.to article URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={generateCampaign}
            disabled={loading || !url}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-md active:scale-95"
          >
            {loading ? "Reasoning..." : "Generate Strategy"}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg max-w-md mx-auto">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}
      </header>

      {/* Campaign Board */}
      <main className="max-w-7xl mx-auto p-8">
        {!campaign.length && !loading && (
          <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
            <p className="text-slate-400 font-medium italic">
              Enter an article URL to architect your campaign.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase animate-pulse">
              Orchestrating Workflow...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {["X", "LinkedIn", "Discord"].map((platform) => (
            <div key={platform} className="flex flex-col">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {platform} Pipeline
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-300">
                  QUEUE: {campaign.length}
                </span>
              </div>

              <div className="space-y-4">
                {campaign.map((dayData, idx) => (
                  <PostCard
                    key={idx}
                    day={dayData.day}
                    platform={platform}
                    content={dayData[platform.toLowerCase()]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
