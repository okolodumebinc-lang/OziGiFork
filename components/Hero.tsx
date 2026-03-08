import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] pt-24 pb-32 font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* Subtle Background Grid for that "Tech/AI" vibe */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
        
        {/* The "Pill" Badge */}
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 group-hover:text-red-700 transition-colors">
              Ozigi v3 is officially live
            </span>
          </div>
        </div>

        {/* The Massive Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          The Content Engine <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">
            For DevRel.
          </span>
        </h1>

        {/* The Authoritative Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          Stop wrestling with generic AI chatbots. Turn your raw technical documentation, release notes, and community updates into structured, multi-platform campaigns without the cheesy buzzwords.
        </p>

        {/* The Action Area */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-900/20"
          >
            Start Engineering Content ⚡
          </Link>
          <Link 
            href="/docs" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            Read the Docs
          </Link>
        </div>

        {/* Social Proof / Identity Banner */}
        <div className="mt-20 pt-10 border-t border-slate-200/60 animate-in fade-in duration-1000 delay-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
            Built for the modern technical workflow
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-60">
            {/* You can replace these with actual SVG icons later */}
            <span className="text-sm font-bold text-slate-600">Developer Education</span>
            <span className="text-sm font-bold text-slate-600">Technical Writing</span>
            <span className="text-sm font-bold text-slate-600">Developer Experience</span>
            <span className="text-sm font-bold text-slate-600">Community Management</span>
          </div>
        </div>

      </div>
    </section>
  );
}
