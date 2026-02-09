
import React from 'react';
import { Question } from '../types';

interface Props {
  question: Question;
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

const QuestionCard: React.FC<Props> = ({ question, selectedAnswer, onAnswerChange, disabled }) => {
  const isCorrect = disabled && selectedAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
  const isWrong = disabled && selectedAnswer && selectedAnswer?.toLowerCase() !== question.correctAnswer?.toLowerCase();
  const isUnanswered = disabled && (!selectedAnswer || selectedAnswer.trim() === "");

  const renderMCQ = () => (
    <div className="grid grid-cols-1 gap-4 mt-8">
      {question.options?.map((opt) => {
        const isThisSelected = selectedAnswer === opt.label;
        const isThisCorrect = disabled && opt.label === question.correctAnswer;
        
        let borderColor = "border-white/5 hover:border-white/20";
        let bgColor = "bg-white/[0.02]";
        let textColor = "text-slate-400";

        if (isThisSelected) {
          borderColor = "border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
          bgColor = "bg-cyan-500/5";
          textColor = "text-white";
        }

        if (disabled) {
          if (isThisCorrect) {
            borderColor = "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
            bgColor = "bg-emerald-500/10";
            textColor = "text-emerald-300";
          } else if (isThisSelected && !isThisCorrect) {
            borderColor = "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]";
            bgColor = "bg-rose-500/10";
            textColor = "text-rose-300";
          }
        }

        return (
          <button
            key={opt.label}
            disabled={disabled}
            onClick={() => onAnswerChange(opt.label)}
            className={`group w-full text-left p-6 rounded-2xl border transition-all flex items-center space-x-6 ${borderColor} ${bgColor} ${disabled ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.98]'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black transition-all ${isThisSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950 scale-110 shadow-[0_0_15px_#22d3ee]' : 'border-white/10 text-slate-500 group-hover:border-white/30 group-hover:text-white'}`}>
              {opt.label}
            </div>
            <div className={`flex-grow font-semibold text-lg tracking-tight ${textColor}`}>
              {opt.text}
            </div>
            {disabled && isThisCorrect && <i className="fa-solid fa-circle-check text-emerald-500 text-xl animate-pulse"></i>}
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
        placeholder="INPUT DATA HERE..."
        className={`w-full p-6 rounded-2xl border bg-white/[0.03] text-white font-bold text-xl tracking-tight focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all placeholder:text-slate-700 ${
          disabled ? (isCorrect ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5') : 'border-white/10'
        }`}
      />
      {disabled && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center">
          <i className="fa-solid fa-key mr-3"></i>
          VERIFIED DATA: <span className="ml-2 text-white">{question.correctAnswer}</span>
        </div>
      )}
    </div>
  );

  const renderWriting = () => (
    <div className="mt-8">
      <div className="relative">
        <textarea
          disabled={disabled}
          value={selectedAnswer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          rows={15}
          placeholder="COMMENCE COMPOSITION..."
          className="w-full p-8 rounded-3xl border border-white/10 bg-white/[0.02] text-white font-medium text-lg focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all resize-none leading-relaxed"
        />
        <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-slate-600 tracking-widest uppercase">
          Neural Uplink: Stable
        </div>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="text-[10px] font-black text-slate-600 tracking-widest uppercase flex items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></span>
          Word Count Sensor: <span className="ml-2 text-cyan-400">{(selectedAnswer || '').trim().split(/\s+/).filter(Boolean).length}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-10 rounded-[2.5rem] glass border-2 transition-all relative overflow-hidden ${disabled && isCorrect ? 'border-emerald-500/30' : disabled && (isWrong || isUnanswered) ? 'border-rose-500/30' : 'border-white/10 shadow-xl'}`}>
      {/* Decorative Corner */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-[2.5rem]"></div>
      
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Sector {question.number}</span>
        </div>
        <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{question.marks} CREDITS</span>
        </div>
      </div>
      
      {question.questionText && (
        <p className="text-white font-black text-2xl leading-[1.2] tracking-tight italic">{question.questionText}</p>
      )}

      {question.type === 'MCQ' && renderMCQ()}
      {question.type === 'FILL' && renderFill()}
      {question.type === 'WRITING' && renderWriting()}
    </div>
  );
};

export default QuestionCard;
