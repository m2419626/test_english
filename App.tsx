
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { JAE_ENGLISH_2025 } from './data';
import { ExamState } from './types';
import ExamHeader from './components/ExamHeader';
import QuestionCard from './components/QuestionCard';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  
  const [extractedCorrectedVersion, setExtractedCorrectedVersion] = useState<string | null>(null);
  const [extractedTranslation, setExtractedTranslation] = useState<string | null>(null);
  const [extractedModelEssay, setExtractedModelEssay] = useState<string | null>(null);
  const [extractedComparison, setExtractedComparison] = useState<string | null>(null);
  
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  
  const [state, setState] = useState<ExamState>({
    currentSectionIndex: 0,
    currentPartIndex: 0,
    answers: {},
    selectedTopicIndex: null,
    isSubmitted: false
  });

  const currentSection = JAE_ENGLISH_2025[state.currentSectionIndex];
  const currentPart = currentSection.parts[state.currentPartIndex];

  const writingQuestionId = useMemo(() => {
    for (const section of JAE_ENGLISH_2025) {
      for (const part of section.parts) {
        for (const q of part.questions) {
          if (q.type === 'WRITING') return q.id;
        }
      }
    }
    return 'w1';
  }, []);

  const calculateScore = useMemo(() => {
    let score = 0;
    JAE_ENGLISH_2025.forEach(section => {
      section.parts.forEach(part => {
        part.questions.forEach(q => {
          if (q.type !== 'WRITING' && q.correctAnswer) {
            const userAnswer = state.answers[q.id];
            if (userAnswer?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
              score += q.marks;
            }
          }
        });
      });
    });
    return score;
  }, [state.answers]);

  const progress = useMemo(() => {
    const total = JAE_ENGLISH_2025.reduce((acc, sec) => acc + sec.parts.reduce((pAcc, p) => pAcc + p.questions.length, 0), 0);
    const answered = Object.keys(state.answers).filter(k => state.answers[k]?.trim()).length;
    return total > 0 ? (answered / total) * 100 : 0;
  }, [state.answers]);

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    if ((state.isSubmitted && !isCorrectionMode) || isProcessingSubmit || isRebooting) return;
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  }, [state.isSubmitted, isProcessingSubmit, isRebooting, isCorrectionMode]);

  const parseAiResponse = (text: string) => {
    const correctedMatch = text.match(/\[CORRECTED_VERSION\]\s*([\s\S]*?)\s*\[\/CORRECTED_VERSION\]/i);
    const translationMatch = text.match(/\[CHINESE_TRANSLATION\]\s*([\s\S]*?)\s*\[\/CHINESE_TRANSLATION\]/i);
    const modelEssayMatch = text.match(/\[MODEL_ESSAY\]\s*([\s\S]*?)\s*\[\/MODEL_ESSAY\]/i);
    const comparisonMatch = text.match(/\[COMPARISON\]\s*([\s\S]*?)\s*\[\/COMPARISON\]/i);
    
    let resultText = text;

    if (correctedMatch) {
      setExtractedCorrectedVersion(correctedMatch[1].trim());
      resultText = resultText.replace(/\[CORRECTED_VERSION\][\s\S]*?\[\/CORRECTED_VERSION\]/gi, '');
    } else setExtractedCorrectedVersion(null);

    if (translationMatch) {
      setExtractedTranslation(translationMatch[1].trim());
      resultText = resultText.replace(/\[CHINESE_TRANSLATION\][\s\S]*?\[\/CHINESE_TRANSLATION\]/gi, '');
    } else setExtractedTranslation(null);

    if (modelEssayMatch) {
      setExtractedModelEssay(modelEssayMatch[1].trim());
      resultText = resultText.replace(/\[MODEL_ESSAY\][\s\S]*?\[\/MODEL_ESSAY\]/gi, '');
    } else setExtractedModelEssay(null);

    if (comparisonMatch) {
      setExtractedComparison(comparisonMatch[1].trim());
      resultText = resultText.replace(/\[COMPARISON\][\s\S]*?\[\/COMPARISON\]/gi, '');
    } else setExtractedComparison(null);

    return resultText.trim();
  };

  const callAIForGrading = async (essay: string) => {
    const prompt = `你是一位極其嚴格的 CEFR 專家導師。請對學生作文進行「七階梯漸進熔斷診斷」。

### 🚨 核心指令：字數極限控制 (WORD COUNT LIMIT)
- **[CORRECTED_VERSION]** 的長度必須嚴格控制在 **210-230 字** 之間。不要寫多，也不要寫少。
- **[MODEL_ESSAY]** 的長度必須嚴格控制在 **210-230 字** 之間。
- 診斷建議請使用繁體中文。

### 📊 診斷邏輯與規則：
1. **起點**：必須從「階梯一」開始評核。
2. **熔斷機制**：若該階評級 **低於 A-**，必須停止診斷，並在 [CORRECTED_VERSION] 提供優化後的 220 字文章。
3. **滿分範文展示**：僅在「階梯六：極致潤色」獲得 Grade A- 或以上時，才輸出 [MODEL_ESSAY] 與 [COMPARISON]。

### 📊 七階梯診斷標準：
1. 階梯一：語法精準
2. 階梯二：詞彙多樣性
3. 階梯三：邏輯銜接
4. 階梯四：文體語氣
5. 階梯五：結構與字數 (目標: 220字)
6. 階梯六：極致潤色 (Native Polish)
7. 階梯七：標竿對照 (Exemplary Comparison)

學生作文：
${essay}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "AI 診斷引擎響應異常。";
    } catch (e) {
      return "連接失敗。";
    }
  };

  const handleReanalyze = useCallback(async (essayToAnalyze?: string) => {
    const essayContent = essayToAnalyze || (state.answers[writingQuestionId] || "").trim();
    if (essayContent.length < 5) return;
    setIsReanalyzing(true);
    setAiFeedback(null);
    const raw = await callAIForGrading(essayContent);
    setAiFeedback(parseAiResponse(raw));
    setIsReanalyzing(false);
  }, [state.answers, writingQuestionId]);

  const handleAdoptAndReanalyze = useCallback(async () => {
    if (extractedCorrectedVersion) {
      const newText = extractedCorrectedVersion;
      handleAnswer(writingQuestionId, newText);
      setAiFeedback(null);
      setExtractedCorrectedVersion(null);
      setExtractedTranslation(null);
      setExtractedModelEssay(null);
      setExtractedComparison(null);
      setTimeout(() => handleReanalyze(newText), 150);
    }
  }, [extractedCorrectedVersion, handleAnswer, writingQuestionId, handleReanalyze]);

  const submitExam = useCallback(() => {
    const essayContent = (state.answers[writingQuestionId] || "").trim();
    if (essayContent.length < 5) return;
    setIsProcessingSubmit(true);
    setIsGrading(true);
    if (isCorrectionMode) setIsCorrectionMode(false);
    setState(prev => ({ ...prev, isSubmitted: true }));
    window.scrollTo({ top: 0, behavior: 'instant' });
    callAIForGrading(essayContent).then(raw => {
      setAiFeedback(parseAiResponse(raw));
      setIsGrading(false);
      setIsProcessingSubmit(false);
    });
  }, [state.answers, isCorrectionMode, writingQuestionId]);

  const rebootSystem = useCallback(() => {
    setIsRebooting(true);
    setTimeout(() => {
      setExamStarted(false);
      setIsGrading(false);
      setIsCorrectionMode(false);
      setAiFeedback(null);
      setExtractedCorrectedVersion(null);
      setExtractedTranslation(null);
      setExtractedModelEssay(null);
      setExtractedComparison(null);
      setState({ currentSectionIndex: 0, currentPartIndex: 0, answers: {}, selectedTopicIndex: null, isSubmitted: false });
      setIsRebooting(false);
    }, 800);
  }, []);

  const enterCorrectionMode = useCallback(() => {
    setIsCorrectionMode(true);
    const idx = JAE_ENGLISH_2025.findIndex(s => s.id === 'section-3');
    if (idx !== -1) setState(prev => ({ ...prev, currentSectionIndex: idx, currentPartIndex: 0 }));
  }, []);

  if (isRebooting) return <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-cyan-400 font-black tracking-widest z-[9999]"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>REBOOTING...</div>;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative">
        <div className="max-w-xl w-full glass rounded-[2.5rem] p-12 text-center shadow-2xl border border-white/5 relative z-10">
          <h1 className="text-6xl font-black text-white mb-4 italic tracking-tighter">JAE <span className="text-cyan-400">2025</span></h1>
          <p className="text-slate-400 text-lg mb-8 uppercase tracking-[0.2em] font-bold opacity-70">Neural Diagnostic System</p>
          <div className="space-y-4">
            <button onClick={() => setExamStarted(true)} className="w-full py-6 bg-white text-slate-950 font-black rounded-2xl text-xl hover:scale-[1.02] transition-all shadow-xl">模擬全考卷</button>
            <button onClick={() => { setExamStarted(true); const idx = JAE_ENGLISH_2025.findIndex(s => s.id === 'section-3'); if (idx !== -1) setState(prev => ({ ...prev, currentSectionIndex: idx })); }} className="w-full py-6 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-black rounded-2xl text-xl hover:scale-[1.02] transition-all">寫作進階優化</button>
          </div>
        </div>
      </div>
    );
  }

  // 報告摘要頁面優化：使用 padding-bottom 確保不被擋住
  if (state.isSubmitted && !isCorrectionMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white py-20 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10 pb-40"> {/* pb-40 確保底部不被遮擋 */}
          <div className="glass rounded-[3rem] p-12 border border-white/10 text-center shadow-2xl relative overflow-hidden">
            <h2 className="text-4xl font-black mb-12 italic uppercase tracking-tighter">診斷報告摘要</h2>
            <div className="inline-flex flex-col items-center bg-cyan-500/5 p-12 rounded-full w-64 h-64 justify-center border border-cyan-500/20">
              <span className="text-7xl font-black italic">{calculateScore.toFixed(1)}</span>
              <span className="text-slate-500 text-2xl font-bold">/ 40.0</span>
            </div>
          </div>
          <div className="glass rounded-[2rem] border border-white/10 p-10 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">七階梯漸進分析詳情</h3>
            <div className="whitespace-pre-wrap leading-relaxed text-lg font-medium text-slate-200">{aiFeedback || "正在讀取 AI 分析報告..."}</div>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={enterCorrectionMode} className="px-12 py-6 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-lg uppercase hover:bg-amber-400 transition-all">進入優化補救模式</button>
            <button onClick={rebootSystem} className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase hover:bg-white/10 transition-all">返回首頁</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white h-screen overflow-hidden">
      <ExamHeader title={isCorrectionMode ? `寫作診斷：${currentSection.title}` : currentSection.title} progress={progress} onExit={rebootSystem} />
      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        <div className={`lg:w-1/2 p-12 overflow-y-auto border-r border-white/5 ${isCorrectionMode ? 'bg-amber-950/10' : 'bg-slate-900/40'}`}>
          <div className="space-y-10">
             <h3 className="text-4xl font-black italic tracking-tighter text-white/90">{currentPart.title}</h3>
             <div className="glass p-10 rounded-[2rem] border border-white/5 text-slate-300 leading-relaxed italic text-lg shadow-xl">{currentPart.passage || currentPart.description}</div>
          </div>
        </div>
        <div className="lg:w-1/2 p-12 overflow-y-auto bg-slate-950/50">
          <div className="max-w-xl mx-auto space-y-12 pb-64"> {/* 增加底部留白 */}
            {currentPart.questions.map(q => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                selectedAnswer={state.answers[q.id]} 
                onAnswerChange={(ans) => handleAnswer(q.id, ans)} 
                disabled={state.isSubmitted && !isCorrectionMode}
                isCorrectionMode={isCorrectionMode}
                selectedTopicIndex={state.selectedTopicIndex}
                onSelectTopic={(idx) => setState(prev => ({ ...prev, selectedTopicIndex: idx }))}
                aiTutorFeedback={q.type === 'WRITING' ? aiFeedback : undefined}
                isReanalyzing={q.type === 'WRITING' ? isReanalyzing : false}
                onAdoptCorrection={q.type === 'WRITING' ? handleAdoptAndReanalyze : undefined}
                hasCorrectionAvailable={q.type === 'WRITING' ? !!extractedCorrectedVersion : false}
                correctedTranslation={q.type === 'WRITING' ? extractedTranslation : undefined}
                modelEssay={q.type === 'WRITING' ? extractedModelEssay : undefined}
                comparisonAnalysis={q.type === 'WRITING' ? extractedComparison : undefined}
              />
            ))}
          </div>
        </div>
      </main>
      {/* 底部導覽列 */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-8 z-[100] flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">JAE 2025 Diagnostic Terminal</div>
        <div className="flex items-center space-x-4">
          {isCorrectionMode && (
            <>
              {extractedCorrectedVersion && (
                <button 
                  onClick={handleAdoptAndReanalyze} 
                  disabled={isReanalyzing} 
                  className="px-8 py-4 bg-amber-500/10 border-2 border-amber-500 text-amber-500 rounded-2xl font-black text-xs uppercase shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center animate-pulse"
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-2 text-sm"></i> 採納建議並重新診斷
                </button>
              )}
              <button 
                onClick={() => handleReanalyze()} 
                disabled={isReanalyzing} 
                className="px-10 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase shadow-lg shadow-amber-500/20 transition-all"
              >
                {isReanalyzing ? "診斷中..." : "執行七階評級"}
              </button>
            </>
          )}
          {state.currentSectionIndex === JAE_ENGLISH_2025.length - 1 && !isCorrectionMode && (
            <button onClick={submitExam} disabled={isProcessingSubmit || state.selectedTopicIndex === null} className="px-12 py-4 bg-cyan-500 text-slate-950 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">
              {isProcessingSubmit ? "正在生成報告..." : "提交並執行全階診斷"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
