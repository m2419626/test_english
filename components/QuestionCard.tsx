
import React, { useState } from 'react';
import { Question } from '../types';

interface Props {
  question: Question;
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
  isCorrectionMode?: boolean;
  selectedTopicIndex?: number | null;
  onSelectTopic?: (index: number) => void;
  aiTutorFeedback?: string | null;
  isReanalyzing?: boolean;
  onAdoptCorrection?: () => void;
  hasCorrectionAvailable?: boolean;
  correctedTranslation?: string | null;
  modelEssay?: string | null;
  comparisonAnalysis?: string | null;
}

const QuestionCard: React.FC<Props> = ({ 
  question, 
  selectedAnswer, 
  onAnswerChange, 
  disabled, 
  isCorrectionMode, 
  selectedTopicIndex,
  onSelectTopic,
  aiTutorFeedback,
  isReanalyzing,
  onAdoptCorrection,
  hasCorrectionAvailable,
  correctedTranslation,
  modelEssay,
  comparisonAnalysis
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'model'>('feedback');

  const topics = [
    "1. My favourite online content creator",
    "2. How young people reduce stress",
    "3. Advantages and disadvantages of exams"
  ];

  const handleAdopt = () => {
    if (onAdoptCorrection) {
      onAdoptCorrection();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const isCorrect = selectedAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
  
  const renderMCQ = () => (
    <div className="grid grid-cols-1 gap-4 mt-8">
      {question.options?.map((opt) => {
        const isThisSelected = selectedAnswer === opt.label;
        const isThisCorrectAnswer = opt.label === question.correctAnswer;
        let borderColor = "border-white/5";
        let bgColor = "bg-white/[0.02]";
        if (isThisSelected) borderColor = "border-cyan-500/50 bg-cyan-500/5";
        if (disabled || isCorrectionMode) {
          if (isThisCorrectAnswer) borderColor = "border-emerald-500 bg-emerald-500/10";
          else if (isThisSelected) borderColor = "border-rose-500 bg-rose-500/10";
        }
        return (
          <button key={opt.label} disabled={disabled} onClick={() => onAnswerChange(opt.label)} className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center space-x-6 ${borderColor} ${bgColor}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black ${isThisSelected ? 'bg-cyan-500 text-slate-950' : 'border-white/10'}`}>{opt.label}</div>
            <div className="flex-grow font-semibold text-lg">{opt.text}</div>
          </button>
        );
      })}
    </div>
  );

  const renderFill = () => (
    <div className="mt-8">
      <input type="text" disabled={disabled} value={selectedAnswer || ''} onChange={(e) => onAnswerChange(e.target.value)} placeholder="INPUT DATA..." className={`w-full p-6 rounded-2xl border bg-white/[0.03] text-white font-bold text-xl focus:outline-none ${ (disabled || isCorrectionMode) ? (isCorrect ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5') : 'border-white/10' }`} />
    </div>
  );

  const renderWriting = () => (
    <div className="mt-8 space-y-8">
      <div className="space-y-4">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">撰寫題目選擇</span>
        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic, idx) => (
            <button key={idx} disabled={(disabled && !isCorrectionMode) || isReanalyzing} onClick={() => onSelectTopic?.(idx)} className={`p-4 rounded-xl text-left text-sm font-bold border transition-all ${ selectedTopicIndex === idx ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-white/5 border-white/5 text-slate-500' }`}>
              {topic}
            </button>
          ))}
        </div>
      </div>

      {selectedTopicIndex !== null && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative group">
            <textarea
              disabled={(disabled && !isCorrectionMode) || isReanalyzing}
              value={selectedAnswer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={15}
              placeholder="請開始撰寫作文，系統將執行七階梯漸進優化診斷..."
              className={`w-full p-10 rounded-[2.5rem] border text-white font-medium text-lg focus:outline-none transition-all resize-none leading-relaxed ${isCorrectionMode ? 'border-amber-500/20 bg-amber-500/5 focus:border-amber-500 shadow-[inset_0_2px_10px_rgba(245,158,11,0.05)]' : 'border-white/10 bg-white/[0.02] focus:border-cyan-500 shadow-inner'}`}
            />
            {showSuccess && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[8px] rounded-[2.5rem] flex items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
                <div className="bg-amber-500 text-slate-950 px-10 py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center">
                  <i className="fa-solid fa-bolt mr-3 animate-pulse"></i> 已採納優化，正在重新評估全七階標竿...
                </div>
              </div>
            )}
          </div>
          
          {(aiTutorFeedback || isReanalyzing) && (
            <div className={`glass rounded-[2rem] border transition-all relative overflow-hidden ${isReanalyzing ? 'border-amber-500/50 bg-amber-500/10 animate-pulse' : 'border-white/10 shadow-2xl'}`}>
               <div className="bg-white/5 px-8 py-4 flex items-center justify-between border-b border-white/5">
                 <div className="flex space-x-2">
                   <button onClick={() => setActiveTab('feedback')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feedback' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>診斷與優化</button>
                   {modelEssay && (
                     <button onClick={() => setActiveTab('model')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'model' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>滿分標竿範文</button>
                   )}
                 </div>
                 {hasCorrectionAvailable && !isReanalyzing && isCorrectionMode && activeTab === 'feedback' && (
                   <button onClick={handleAdopt} className="px-4 py-2 bg-amber-500/10 border border-amber-500/50 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all">
                     採納 AI 優化
                   </button>
                 )}
               </div>

               <div className="p-10">
                 {activeTab === 'feedback' ? (
                   <div className={`space-y-6 ${isReanalyzing ? 'opacity-30 blur-sm' : 'opacity-100 transition-all duration-700'}`}>
                     <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                        {aiTutorFeedback || "初始化診斷引擎中..."}
                     </div>
                     {correctedTranslation && !isReanalyzing && (
                       <div className="pt-6 border-t border-white/10">
                         <h4 className="text-cyan-500 text-[10px] font-black uppercase tracking-widest mb-3">優化版本翻譯</h4>
                         <p className="text-slate-400 italic text-sm leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">{correctedTranslation}</p>
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="space-y-4">
                       <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                         <i className="fa-solid fa-star mr-2"></i> Model Essay (滿分範文)
                       </h4>
                       <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-3xl text-slate-200 text-lg leading-relaxed font-medium whitespace-pre-wrap italic shadow-inner">
                         {modelEssay}
                       </div>
                     </div>
                     
                     {comparisonAnalysis && (
                       <div className="space-y-4">
                         <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                           <i className="fa-solid fa-code-compare mr-2"></i> 差距對照分析 (Benchmark Analysis)
                         </h4>
                         <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                           {comparisonAnalysis}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="h-px flex-grow bg-white/5"></div>
            <div className="bg-white/5 px-6 py-2 rounded-full border border-white/5 flex items-center space-x-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Word Count</span>
              <span className={`text-sm font-black ${(selectedAnswer || '').trim().split(/\s+/).filter(Boolean).length >= 220 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {(selectedAnswer || '').trim().split(/\s+/).filter(Boolean).length}
              </span>
              <span className="text-[10px] text-slate-700 font-bold">/ 220</span>
            </div>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`p-10 rounded-[3.5rem] glass border-2 transition-all relative overflow-hidden ${isCorrectionMode ? 'border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.05)]' : (disabled && isCorrect ? 'border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'border-white/10')}`}>
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <div className={`w-1.5 h-1.5 rounded-full ${isCorrectionMode ? 'bg-amber-500 animate-pulse' : 'bg-cyan-500'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isCorrectionMode ? 'text-amber-500' : 'text-cyan-500'}`}>Question {question.number}</span>
        </div>
        <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">{question.marks} MARKS</div>
      </div>
      {question.questionText && <p className="text-white font-black text-2xl italic leading-snug mb-4">{question.questionText}</p>}
      {question.type === 'MCQ' && renderMCQ()}
      {question.type === 'FILL' && renderFill()}
      {question.type === 'WRITING' && renderWriting()}
    </div>
  );
};

export default QuestionCard;
