import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface SettingsModalProps {
  session: any;
  onClose: () => void;
}

export default function SettingsModal({
  session,
  onClose,
}: SettingsModalProps) {
  const [persona, setPersona] = useState("");
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing preferences from Supabase user metadata
    if (session?.user?.user_metadata) {
      setPersona(session.user.user_metadata.persona || "");
      setWebhook(session.user.user_metadata.discord_webhook || "");
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    // Save preferences back to Supabase auth metadata
    const { error } = await supabase.auth.updateUser({
      data: { persona, discord_webhook: webhook },
    });
    setLoading(false);
    if (!error) onClose();
    else console.error("Failed to update settings:", error.message);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl transition-colors"
          aria-label="Close Settings"
        >
          ×
        </button>

        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">
          Workspace Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Custom Persona Voice
            </label>
            <textarea
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium min-h-[100px] resize-none text-slate-900"
              placeholder="e.g., You are an expert developer educator who writes punchy, highly technical content without using emojis or fluff..."
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Discord Webhook URL
            </label>
            <input
              type="url"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 text-[10px] sm:text-xs shadow-lg"
          >
            {loading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
