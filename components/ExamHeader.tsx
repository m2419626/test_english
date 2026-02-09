
import React from 'react';

interface Props {
  title: string;
  progress: number;
  onExit: () => void;
}

const ExamHeader: React.FC<Props> = ({ title, progress, onExit }) => {
  return (
    <header className="sticky top-0 z-[1000] glass border-b border-white/10 px-10 py-5 shadow-2xl backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button 
            onClick={onExit}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <i className="fa-solid fa-power-off text-slate-500 group-hover:text-rose-400 transition-colors"></i>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] mb-1 opacity-70">Neural Link Active</span>
            <h1 className="text-xl font-black text-white italic tracking-tighter truncate max-w-xs sm:max-w-md">{title}</h1>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-center flex-1 max-w-md mx-20 space-y-2">
          <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between w-full px-1">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Progress Monitoring</span>
            <span className="text-[10px] font-black text-cyan-400 italic">{Math.round(progress)}% Complete</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Synchronized</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
