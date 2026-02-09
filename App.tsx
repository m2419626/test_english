
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { JAE_ENGLISH_2025 } from './data';
import { ExamState } from './types';
import ExamHeader from './components/ExamHeader';
import QuestionCard from './components/QuestionCard';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [state, setState] = useState<ExamState>({
    currentSectionIndex: 0,
    currentPartIndex: 0,
    answers: {},
    isSubmitted: false
  });

  const currentSection = JAE_ENGLISH_2025[state.currentSectionIndex];
  const currentPart = currentSection.parts[state.currentPartIndex];

  const totalQuestions = useMemo(() => {
    return JAE_ENGLISH_2025.reduce((acc, sec) => 
      acc + sec.parts.reduce((pAcc, p) => pAcc + (p.questions?.length || 0), 0), 0
    );
  }, []);

  const answeredCount = useMemo(() => {
    return Object.keys(state.answers).filter(k => state.answers[k] && state.answers[k].trim() !== '').length;
  }, [state.answers]);

  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    if (state.isSubmitted || isProcessingSubmit || isRebooting) return;
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  }, [state.isSubmitted, isProcessingSubmit, isRebooting]);

  const callAIForGrading = async (essay: string) => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return "### [ACCESS DENIED]\nNeural link failed: API Key Missing.";

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as a Cyber-Examiner for the 2025 JAE English Exam. 
      Analyze the following essay for Content, Organization, and Language. 
      Provide a futuristic, professional feedback report in Traditional Chinese.
      Essay: ${essay}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "Report compiled successfully.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Critical Error: Neural feedback circuit interrupted.";
    }
  };

  const submitExam = useCallback(() => {
    setIsProcessingSubmit(true);
    setState(prev => ({ ...prev, isSubmitted: true }));
    window.scrollTo({ top: 0, behavior: 'instant' });

    const essayContent = (state.answers['w1'] || "").trim();
    if (essayContent.length > 5) {
      setIsGrading(true);
      callAIForGrading(essayContent).then(feedback => {
        setAiFeedback(feedback);
        setIsGrading(false);
        setIsProcessingSubmit(false);
      });
    } else {
      setAiFeedback("Insufficient data for essay analysis.");
      setIsProcessingSubmit(false);
    }
  }, [state.answers]);

  const rebootSystem = useCallback(() => {
    setIsRebooting(true);
    // Cinematic reset sequence
    setTimeout(() => {
      setExamStarted(false);
      setIsGrading(false);
      setShowReview(false);
      setAiFeedback(null);
      setIsProcessingSubmit(false);
      setState({
        currentSectionIndex: 0,
        currentPartIndex: 0,
        answers: {},
        isSubmitted: false
      });
      setIsRebooting(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 1800);
  }, []);

  const nextPart = useCallback(() => {
    if (state.currentPartIndex < currentSection.parts.length - 1) {
      setState(prev => ({ ...prev, currentPartIndex: prev.currentPartIndex + 1 }));
    } else if (state.currentSectionIndex < JAE_ENGLISH_2025.length - 1) {
      setState(prev => ({
        ...prev,
        currentSectionIndex: prev.currentSectionIndex + 1,
        currentPartIndex: 0
      }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentPartIndex, state.currentSectionIndex, currentSection.parts.length]);

  const prevPart = useCallback(() => {
    if (state.currentPartIndex > 0) {
      setState(prev => ({ ...prev, currentPartIndex: prev.currentPartIndex - 1 }));
    } else if (state.currentSectionIndex > 0) {
      const prevSection = JAE_ENGLISH_2025[state.currentSectionIndex - 1];
      setState(prev => ({
        ...prev,
        currentSectionIndex: prev.currentSectionIndex - 1,
        currentPartIndex: prevSection.parts.length - 1
      }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentPartIndex, state.currentSectionIndex]);

  const calculateScore = useMemo(() => {
    let score = 0;
    JAE_ENGLISH_2025.forEach(section => {
      section.parts.forEach(part => {
        part.questions.forEach(q => {
          if (q.type !== 'WRITING') {
            const userAns = (state.answers[q.id] || "").trim().toLowerCase();
            const correctAns = (q.correctAnswer || "").trim().toLowerCase();
            if (userAns !== "" && userAns === correctAns) {
              score += q.marks;
            }
          }
        });
      });
    });
    return score;
  }, [state.answers]);

  // Reboot Overlay
  if (isRebooting) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_15px_#22d3ee]"></div>
          <div className="space-y-4 w-full">
            <h2 className="text-cyan-400 text-xl font-black tracking-[0.2em] text-center animate-pulse">SYSTEM REBOOTING</h2>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 animate-[reboot-progress_1.8s_ease-in-out_forwards]"></div>
            </div>
            <div className="text-[10px] text-slate-500 flex flex-col space-y-1">
              <p className="animate-pulse">>> Flushing memory cores...</p>
              <p className="animate-pulse delay-75">>> Resetting neural link interfaces...</p>
              <p className="animate-pulse delay-150">>> Initializing safe boot protocol...</p>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes reboot-progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>

        <div className="max-w-xl w-full glass rounded-[2rem] border border-white/10 p-12 text-center relative z-10">
          <div className="mb-8 inline-block px-4 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-black tracking-widest uppercase">
            System Initialization v2.6
          </div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic">JAE <span className="text-cyan-400">2025</span></h1>
          <p className="text-slate-400 text-lg mb-12 font-medium">Neural Interface English Proficiency Simulator</p>
          
          <button 
            onClick={() => setExamStarted(true)}
            className="group relative w-full py-6 bg-white text-slate-950 font-black rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 text-xl tracking-tight group-hover:text-white transition-colors uppercase">Initialize Exam Sequence</span>
          </button>
          
          <div className="mt-8 flex justify-center space-x-6 text-slate-600 text-[10px] font-bold tracking-widest uppercase">
            <span>// Auto-Grading Active</span>
            <span>// Neural AI Support</span>
          </div>
        </div>
      </div>
    );
  }

  if (state.isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white py-12 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="glass rounded-[2.5rem] p-12 border border-white/10 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee]"></div>
            
            <h2 className="text-4xl font-black mb-10 tracking-tight italic">TERMINAL <span className="text-cyan-400 uppercase">Analysis</span></h2>
            
            <div className="inline-flex flex-col items-center bg-white/5 border border-white/10 p-10 rounded-full w-64 h-64 justify-center shadow-[0_0_50px_rgba(34,211,238,0.1)]">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Raw Core Score</p>
              <div className="flex items-baseline">
                <span className="text-7xl font-black text-white neon-text italic">{calculateScore.toFixed(1)}</span>
                <span className="text-slate-600 text-2xl font-bold ml-2">/40</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center px-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center">
                <i className="fa-solid fa-microchip mr-2"></i> Neural Feedback Report
              </h3>
              {isGrading && <div className="flex space-x-1"><div className="w-1 h-1 bg-cyan-400 animate-bounce"></div><div className="w-1 h-1 bg-cyan-400 animate-bounce delay-100"></div><div className="w-1 h-1 bg-cyan-400 animate-bounce delay-200"></div></div>}
            </div>
            <div className="p-10 text-slate-300 whitespace-pre-wrap leading-relaxed font-medium markdown-content">
              {aiFeedback || "Accessing neural cores for essay evaluation..."}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pb-24">
            <button 
              onClick={() => setShowReview(!showReview)} 
              className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all text-xs tracking-widest uppercase"
            >
              {showReview ? "Close Data Logs" : "Retrieve Data Logs"}
            </button>
            <button 
              onClick={rebootSystem} 
              className="px-10 py-5 bg-cyan-500 text-slate-950 rounded-2xl font-black hover:bg-cyan-400 transition-all shadow-lg text-xs tracking-widest uppercase"
            >
              Reboot System
            </button>
          </div>

          {showReview && (
            <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {JAE_ENGLISH_2025.map(section => (
                <div key={section.id} className="space-y-6">
                  <h4 className="text-sm font-black text-cyan-400 tracking-[0.3em] uppercase opacity-70 flex items-center">
                    <span className="w-8 h-px bg-cyan-500/30 mr-4"></span>
                    {section.title}
                  </h4>
                  {section.parts.map(part => (
                    <div key={part.id} className="space-y-6">
                      {part.questions.map(q => (
                        <QuestionCard key={q.id} question={q} selectedAnswer={state.answers[q.id]} onAnswerChange={() => {}} disabled={true} />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white h-screen overflow-hidden font-['Space_Grotesk']">
      <ExamHeader title={currentSection.title} progress={progress} onExit={() => setExamStarted(false)} />

      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        <div className="lg:w-1/2 p-10 overflow-y-auto border-r border-white/5 bg-slate-900/40 relative">
          <div className="space-y-10">
            <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded">
              {currentSection.subtitle}
            </div>
            <h3 className="text-4xl font-black leading-[1.1] text-white tracking-tighter italic">
              {currentPart.title}
            </h3>
            <div className="glass p-10 rounded-[2rem] border border-white/5 text-slate-300 leading-relaxed font-medium text-lg whitespace-pre-wrap italic shadow-2xl relative">
              <div className="absolute top-4 right-6 opacity-10 text-4xl">
                <i className="fa-solid fa-quote-right"></i>
              </div>
              {currentPart.passage || currentPart.description || "Synthesizing input data..."}
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 p-10 overflow-y-auto bg-slate-950/50">
          <div className="max-w-xl mx-auto space-y-10 pb-48">
            {currentPart.questions.map(q => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                selectedAnswer={state.answers[q.id]} 
                onAnswerChange={(ans) => handleAnswer(q.id, ans)} 
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-8 z-[999] shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={prevPart} 
            disabled={state.currentSectionIndex === 0 && state.currentPartIndex === 0} 
            className="flex items-center space-x-3 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 font-bold disabled:opacity-5 transition-all group"
          >
            <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-1 transition-transform"></i>
            <span className="text-xs uppercase tracking-widest font-black">Previous Sector</span>
          </button>

          <div className="hidden lg:flex flex-1 justify-center space-x-1 px-12">
            {JAE_ENGLISH_2025.map((sec, sIdx) => 
              sec.parts.map((p, pIdx) => {
                const isActive = state.currentSectionIndex === sIdx && state.currentPartIndex === pIdx;
                const isPassed = state.currentSectionIndex > sIdx || (state.currentSectionIndex === sIdx && state.currentPartIndex > pIdx);
                return (
                  <div key={`${sIdx}-${pIdx}`} className={`h-1 flex-1 rounded-full transition-all duration-500 ${isActive ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] scale-y-150' : isPassed ? 'bg-slate-600' : 'bg-slate-800'}`}></div>
                );
              })
            )}
          </div>

          <div className="flex space-x-4">
            {state.currentSectionIndex === JAE_ENGLISH_2025.length - 1 && state.currentPartIndex === currentSection.parts.length - 1 ? (
              <button 
                onClick={submitExam} 
                className="group relative bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-12 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                <span className="relative z-10 text-xs uppercase tracking-widest font-black">Finalize & Submit</span>
                <i className="fa-solid fa-bolt ml-3 relative z-10 animate-pulse"></i>
              </button>
            ) : (
              <button 
                onClick={nextPart} 
                className="group flex items-center space-x-3 px-12 py-4 bg-white text-slate-950 font-black rounded-2xl hover:scale-[1.02] transition-all"
              >
                <span className="text-xs uppercase tracking-widest font-black">Next Sector</span>
                <i className="fa-solid fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
