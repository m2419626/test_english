
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
  correctedTranslation
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const topics = [
    "1. My favourite online content creator",
    "2. How young people reduce stress",
    "3. Advantages and disadvantages of exams"
  ];

  const handleAdopt = () => {
    if (onAdoptCorrection) {
      onAdoptCorrection();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const isCorrect = selectedAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
  
  const renderMCQ = () => (
    <div className="grid grid-cols-1 gap-4 mt-8">
      {question.options?.map((opt) => {
        const isThisSelected = selectedAnswer === opt.label;
        const isThisCorrectAnswer = opt.label === question.correctAnswer;
        
        let borderColor = "border-white/5 hover:border-white/20";
        let bgColor = "bg-white/[0.02]";
        let textColor = "text-slate-400";

        if (isThisSelected) {
          borderColor = isCorrectionMode ? "border-amber-500/50" : "border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
          bgColor = isCorrectionMode ? "bg-amber-500/5" : "bg-cyan-500/5";
          textColor = "text-white";
        }

        if (disabled || isCorrectionMode) {
          if (isThisCorrectAnswer && (disabled || (isCorrectionMode && isThisSelected))) {
            borderColor = "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
            bgColor = "bg-emerald-500/10";
            textColor = "text-emerald-300";
          } else if (isThisSelected && !isThisCorrectAnswer) {
            borderColor = "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
            bgColor = "bg-rose-500/10";
            textColor = "text-rose-300";
          }
        }

        return (
          <button
            key={opt.label}
            disabled={disabled}
            onClick={() => onAnswerChange(opt.label)}
            className={`group w-full text-left p-6 rounded-2xl border transition-all flex items-center space-x-6 ${borderColor} ${bgColor} ${disabled ? 'cursor-default' : 'hover:scale-[1.01]'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black transition-all ${isThisSelected ? (isCorrectionMode ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]') : 'border-white/10 text-slate-500 group-hover:border-white/30'}`}>
              {opt.label}
            </div>
            <div className={`flex-grow font-semibold text-lg tracking-tight ${textColor}`}>
              {opt.text}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderFill = () => (
    <div className="mt-8 relative">
      <input
        type="text"
        disabled={disabled}
        value={selectedAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="INPUT DATA..."
        className={`w-full p-6 rounded-2xl border bg-white/[0.03] text-white font-bold text-xl focus:outline-none transition-all ${
          (disabled || isCorrectionMode) ? (isCorrect ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5') : 'border-white/10 focus:border-cyan-500 shadow-inner'
        }`}
      />
      {(disabled || isCorrectionMode) && (
        <div className="mt-4 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <i className="fa-solid fa-key text-cyan-500/50"></i>
          <span>Correct Value:</span> 
          <span className="text-white bg-white/10 px-2 py-0.5 rounded">{question.correctAnswer}</span>
        </div>
      )}
    </div>
  );

  const renderWriting = () => (
    <div className="mt-8 space-y-8">
      {/* Topic Selection Buttons */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Select Your Essay Topic (Required)</span>
        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic, idx) => (
            <button
              key={idx}
              disabled={disabled && !isCorrectionMode}
              onClick={() => onSelectTopic?.(idx)}
              className={`p-4 rounded-xl text-left text-sm font-bold border transition-all ${
                selectedTopicIndex === idx 
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg' 
                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {selectedTopicIndex !== null && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
          <div className="relative">
            <textarea
              disabled={disabled && !isCorrectionMode}
              value={selectedAnswer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={15}
              placeholder="START WRITING YOUR ESSAY HERE..."
              className={`w-full p-10 rounded-[2.5rem] border text-white font-medium text-lg focus:outline-none transition-all resize-none leading-relaxed ${isCorrectionMode ? 'border-amber-500/20 bg-amber-500/5 focus:border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.05)]' : 'border-white/10 bg-white/[0.02] focus:border-cyan-500 shadow-inner'}`}
            />
            {showSuccess && (
              <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[4px] rounded-[2.5rem] flex items-center justify-center z-50 animate-in fade-in duration-500">
                <div className="bg-amber-500 text-slate-950 px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center">
                  <i className="fa-solid fa-check-double mr-3"></i> 修正已套用
                </div>
              </div>
            )}
          </div>
          
          {(aiTutorFeedback || isReanalyzing) && (
            <div className={`glass p-10 rounded-[2rem] border transition-all duration-700 ${isReanalyzing ? 'border-amber-500/50 bg-amber-500/10 animate-pulse' : 'border-amber-500/20 bg-amber-900/5 shadow-2xl shadow-amber-900/10'}`}>
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-3 text-amber-500">
                   <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                     <i className={`fa-solid ${isReanalyzing ? 'fa-spinner fa-spin' : 'fa-stairs'}`}></i>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Diagnostic Mode</span>
                 </div>
                 {isCorrectionMode && hasCorrectionAvailable && !isReanalyzing && (
                   <button onClick={handleAdopt} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center shadow-lg active:scale-95 group">
                     <i className="fa-solid fa-wand-magic-sparkles mr-2 group-hover:rotate-12 transition-transform"></i> 採納 AI 階梯修正
                   </button>
                 )}
               </div>
               
               <div className={`text-slate-300 text-base leading-relaxed markdown-content transition-opacity duration-500 whitespace-pre-wrap ${isReanalyzing ? 'opacity-30' : 'opacity-100'}`}>
                 {aiTutorFeedback}
                 
                 {correctedTranslation && !isReanalyzing && (
                   <div className="mt-8 pt-8 border-t border-white/10">
                     <h4 className="text-cyan-500 text-[10px] font-black uppercase tracking-widest mb-4">修正版全文中譯：</h4>
                     <p className="text-slate-300 italic text-sm leading-relaxed">
                       {correctedTranslation}
                     </p>
                   </div>
                 )}
               </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="h-px flex-grow bg-white/5"></div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center">
              Word Count: <span className={`ml-2 ${isCorrectionMode ? 'text-amber-400' : 'text-cyan-400'}`}>{(selectedAnswer || '').trim().split(/\s+/).filter(Boolean).length}</span>
            </div>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`p-10 rounded-[3rem] glass border-2 transition-all relative overflow-hidden ${isCorrectionMode ? 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]' : (disabled && isCorrect ? 'border-emerald-500/20' : 'border-white/10 shadow-xl')}`}>
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <div className={`w-1 h-1 rounded-full ${isCorrectionMode ? 'bg-amber-500' : 'bg-cyan-500'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isCorrectionMode ? 'text-amber-500' : 'text-cyan-500'}`}>Part {question.number}</span>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{question.marks} MARKS</div>
      </div>
      
      {question.questionText && (
        <p className="text-white font-black text-2xl tracking-tight italic leading-snug">{question.questionText}</p>
      )}

      {question.type === 'MCQ' && renderMCQ()}
      {question.type === 'FILL' && renderFill()}
      {question.type === 'WRITING' && renderWriting()}
    </div>
  );
};

export default QuestionCard;
