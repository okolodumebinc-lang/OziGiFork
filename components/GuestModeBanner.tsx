"use client";

export default function GuestModeBanner({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  return (
    <div className="mb-8 p-5 md:p-6 rounded-[1.5rem] bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl animate-in fade-in zoom-in-95">
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 mb-2">
           <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Read-Only Mode</span>
        </div>
        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-1">
          Engine operating at 20% capacity.
        </h3>
        <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl">
          Sign in to unlock resuable personas, save your strategy history, and enable one-click OAuth publishing directly to LinkedIn.
        </p>
      </div>
      <button
        onClick={onSignIn}
        className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all shrink-0 active:scale-95 w-full sm:w-auto shadow-sm"
      >
        Sign In 
      </button>
    </div>
  );
}