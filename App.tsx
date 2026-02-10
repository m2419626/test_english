
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { JAE_ENGLISH_2025 } from './data';
import { ExamState } from './types';
import ExamHeader from './components/ExamHeader';
import QuestionCard from './components/QuestionCard';
import { GoogleGenAI } from "@google/genai";

type AIProvider = 'gemini' | 'groq';

const App: React.FC = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [extractedCorrectedVersion, setExtractedCorrectedVersion] = useState<string | null>(null);
  const [extractedTranslation, setExtractedTranslation] = useState<string | null>(null);
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
    if ((state.isSubmitted && !isCorrectionMode) || isProcessingSubmit || isRebooting) return;
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  }, [state.isSubmitted, isProcessingSubmit, isRebooting, isCorrectionMode]);

  const handleSelectTopic = useCallback((index: number) => {
    setState(prev => ({ ...prev, selectedTopicIndex: index }));
  }, []);

  const parseAiResponse = (text: string) => {
    const correctedMatch = text.match(/\[CORRECTED_VERSION\]([\s\S]*?)\[\/CORRECTED_VERSION\]/);
    const translationMatch = text.match(/\[CHINESE_TRANSLATION\]([\s\S]*?)\[\/CHINESE_TRANSLATION\]/);
    
    let resultText = text;

    if (correctedMatch && correctedMatch[1]) {
      const fullCorrected = correctedMatch[1].trim();
      setExtractedCorrectedVersion(fullCorrected);
      resultText = resultText.replace(/\[CORRECTED_VERSION\][\s\S]*?\[\/CORRECTED_VERSION\]/, '').trim();
    } else {
      setExtractedCorrectedVersion(null);
    }

    if (translationMatch && translationMatch[1]) {
      const translation = translationMatch[1].trim();
      setExtractedTranslation(translation);
      resultText = resultText.replace(/\[CHINESE_TRANSLATION\][\s\S]*?\[\/CHINESE_TRANSLATION\]/, '').trim();
    } else {
      setExtractedTranslation(null);
    }

    return resultText;
  };

  const callAIForGrading = async (essay: string, topicIndex: number | null, provider: AIProvider) => {
    const topics = [
      "Favorite online content creator and why",
      "How young people reduce stress in everyday life",
      "Advantages and disadvantages of exams"
    ];
    const selectedTopic = topicIndex !== null ? topics[topicIndex] : "General Essay";
    const currentWordCount = essay.trim().split(/\s+/).filter(Boolean).length;

    const prompt = `你是一位精通 CEFR B2-C1-C2 標準的專業英文導師。
針對題目「${selectedTopic}」，對學生的作文進行「六階梯漸進式診斷」。

【診斷核心規則】：
必須從第 1 階開始檢測。只有當前一階達到「A-」或以上評級時，才允許顯示下一階的檢測結果。若某階不達標，則停在該階。

1. 階梯一：離題檢查 (Task Relevance) - 內容是否偏離題目。
2. 階梯二：語法精準 (Grammar Accuracy) - 基礎與進階語法準確度。
3. 階梯三：C1-C2 高階用詞 (Lexical Sophistication) - 是否有精確、優雅的高級詞彙。
4. 階梯四：題型結構 (Genre Structure) - 是否有合適的分段與邏輯銜接。
5. 階梯五：漸進字數 (Stepwise Progression) - 若前四項 A- 以上且目前 ${currentWordCount} 字小於 200 字，要求再增加 20 字細節。
6. 階梯六：極致 C2 美化 (C2 Polish) - 最後修辭美感與深度提升。

【輸出格式】：
- **當前階梯與評級**：標註停留在第幾階。
- **修正版本意涵 (Meaning of Correction)**：請務必用中文詳細解釋修正後的內容在表達什麼樣更精緻、精確的意思，以及與原句的差異。
- **全文中文譯文**：在 [CHINESE_TRANSLATION] 標籤內提供全文的中文對照。

### 👨‍🏫 診斷報告
- **當前解鎖標準**：[名稱]
- **當前階梯評級**：[評級]
- **診斷重點 (Diagnosis)**：(中英對照)
- **修正版本意涵 (Meaning of Correction)**：(中文詳細解釋)
- **下一步優化目標 (Next Goal)**：(中英對照)

[CORRECTED_VERSION]
(修正後的英文全文)
[/CORRECTED_VERSION]

[CHINESE_TRANSLATION]
(修正後全文的繁體中文翻譯)
[/CHINESE_TRANSLATION]

學生作文：
${essay}`;

    try {
      if (provider === 'gemini') {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return "### [錯誤] 未偵測到 Gemini API Key。";
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        return response.text || "Gemini 回應為空。";
      } else {
        // Groq API Call
        const groqKey = process.env.GROQ_API_KEY; 
        if (!groqKey) return "### [設定錯誤]\n未偵測到 `GROQ_API_KEY`。請確認環境變數已正確配置。";
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 4096
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return `### [Groq API 錯誤]\n狀態碼: ${response.status}\n原因: ${errorData.error?.message || '未知連線問題'}`;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return content || "Groq 引擎回傳了空的結果。";
      }
    } catch (error) {
      return `### [網路/系統異常]\n${error instanceof Error ? error.message : "發生不可預知的錯誤"}`;
    }
  };

  const submitExam = useCallback(() => {
    const essayContent = (state.answers[writingQuestionId] || "").trim();
    if (essayContent.length < 5) {
        alert("請先完成作文內容。");
        return;
    }

    setIsProcessingSubmit(true);
    setIsGrading(true);
    
    // 如果在修正模式，先關閉模式再顯示報告
    if (isCorrectionMode) {
        setIsCorrectionMode(false);
    }
    
    setState(prev => ({ ...prev, isSubmitted: true }));
    window.scrollTo({ top: 0, behavior: 'instant' });

    callAIForGrading(essayContent, state.selectedTopicIndex, aiProvider).then(rawFeedback => {
      const cleanFeedback = parseAiResponse(rawFeedback);
      setAiFeedback(cleanFeedback);
      setIsGrading(false);
      setIsProcessingSubmit(false);
    });
  }, [state.answers, state.selectedTopicIndex, aiProvider, writingQuestionId, isCorrectionMode]);

  const handleReanalyze = useCallback(async () => {
    const essayContent = (state.answers[writingQuestionId] || "").trim();
    if (essayContent.length < 5) return;
    setIsReanalyzing(true);
    const rawFeedback = await callAIForGrading(essayContent, state.selectedTopicIndex, aiProvider);
    const cleanFeedback = parseAiResponse(rawFeedback);
    setAiFeedback(cleanFeedback);
    setIsReanalyzing(false);
  }, [state.answers, state.selectedTopicIndex, aiProvider, writingQuestionId]);

  const handleAdoptCorrection = useCallback(() => {
    if (extractedCorrectedVersion) {
      handleAnswer(writingQuestionId, extractedCorrectedVersion);
      setExtractedCorrectedVersion(null);
    }
  }, [extractedCorrectedVersion, handleAnswer, writingQuestionId]);

  const startExam = useCallback(() => setExamStarted(true), []);

  const jumpToWriting = useCallback(() => {
    setExamStarted(true);
    const writingSectionIndex = JAE_ENGLISH_2025.findIndex(s => s.id === 'section-3');
    if (writingSectionIndex !== -1) {
      setState(prev => ({ ...prev, currentSectionIndex: writingSectionIndex, currentPartIndex: 0 }));
    }
  }, []);

  const rebootSystem = useCallback(() => {
    setIsRebooting(true);
    setTimeout(() => {
      setExamStarted(false);
      setIsGrading(false);
      setIsCorrectionMode(false);
      setAiFeedback(null);
      setExtractedCorrectedVersion(null);
      setExtractedTranslation(null);
      setState({
        currentSectionIndex: 0,
        currentPartIndex: 0,
        answers: {},
        selectedTopicIndex: null,
        isSubmitted: false
      });
      setIsRebooting(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 1200);
  }, []);

  const enterCorrectionMode = useCallback(() => {
    setIsCorrectionMode(true);
    const writingSectionIndex = JAE_ENGLISH_2025.findIndex(s => s.id === 'section-3');
    if (writingSectionIndex !== -1) {
      setState(prev => ({ ...prev, currentSectionIndex: writingSectionIndex, currentPartIndex: 0 }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const nextPart = useCallback(() => {
    if (state.currentPartIndex < currentSection.parts.length - 1) {
      setState(prev => ({ ...prev, currentPartIndex: prev.currentPartIndex + 1 }));
    } else if (state.currentSectionIndex < JAE_ENGLISH_2025.length - 1) {
      setState(prev => ({ ...prev, currentSectionIndex: prev.currentSectionIndex + 1, currentPartIndex: 0 }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentPartIndex, state.currentSectionIndex, currentSection.parts.length]);

  const prevPart = useCallback(() => {
    if (state.currentPartIndex > 0) {
      setState(prev => ({ ...prev, currentPartIndex: prev.currentPartIndex - 1 }));
    } else if (state.currentSectionIndex > 0) {
      const prevSection = JAE_ENGLISH_2025[state.currentSectionIndex - 1];
      setState(prev => ({ ...prev, currentSectionIndex: prev.currentSectionIndex - 1, currentPartIndex: prevSection.parts.length - 1 }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentPartIndex, state.currentSectionIndex]);

  if (isRebooting) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-cyan-400 text-sm font-black tracking-[0.3em] animate-pulse">OPTIMIZING AI LADDER...</h2>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-xl w-full glass rounded-[2.5rem] border border-white/10 p-12 text-center">
          <div className="mb-6 inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest uppercase italic italic">Multi-Core Engine Ready</div>
          <h1 className="text-6xl font-black text-white mb-4 italic tracking-tighter">JAE <span className="text-cyan-400">2025</span></h1>
          <p className="text-slate-400 text-lg mb-8 font-medium">澳門四校聯考英文模擬介面</p>
          <div className="space-y-4">
            <button onClick={startExam} className="w-full py-6 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 transition-all text-xl uppercase shadow-[0_0_30px_rgba(255,255,255,0.1)]">開始完整測驗</button>
            <button onClick={jumpToWriting} className="w-full py-6 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-black rounded-2xl hover:scale-105 transition-all text-xl uppercase">直接練習作文</button>
          </div>
        </div>
      </div>
    );
  }

  if (state.isSubmitted && !isCorrectionMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white py-12 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="glass rounded-[3rem] p-12 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            <h2 className="text-4xl font-black mb-12 tracking-tight italic uppercase">測驗分析報告</h2>
            <div className="inline-flex flex-col items-center bg-white/5 p-12 rounded-full w-64 h-64 justify-center border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Score</span>
              <span className="text-7xl font-black text-white italic">{calculateScore.toFixed(1)}</span>
              <span className="text-slate-600 text-2xl font-bold">/ 40.0</span>
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center">
                <i className="fa-solid fa-stairs mr-2"></i> 六階梯診斷報告 ({aiProvider.toUpperCase()} 引擎)
              </h3>
              {isGrading && <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>}
            </div>
            <div className="p-10 text-slate-300 space-y-8">
              <div className="whitespace-pre-wrap leading-relaxed markdown-content text-lg">{aiFeedback || "正在等待診斷數據..."}</div>
              {extractedCorrectedVersion && (
                <div className="space-y-6 pt-8 border-t border-white/10">
                  <div>
                    <h4 className="text-amber-500 text-xs font-black uppercase tracking-widest mb-4">AI 優化建議版本：</h4>
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/5 text-white italic font-medium leading-relaxed">{extractedCorrectedVersion}</div>
                  </div>
                  {extractedTranslation && (
                    <div>
                      <h4 className="text-cyan-500 text-xs font-black uppercase tracking-widest mb-4">修正版全文對照：</h4>
                      <div className="bg-cyan-500/5 p-8 rounded-2xl border border-cyan-500/10 text-slate-300 leading-relaxed">{extractedTranslation}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pb-24">
            <button onClick={enterCorrectionMode} className="px-12 py-6 bg-amber-500 text-slate-950 rounded-2xl font-black hover:bg-amber-400 transition-all uppercase flex items-center shadow-lg"><i className="fa-solid fa-wrench mr-2"></i> 進入優化補救模式</button>
            <button onClick={rebootSystem} className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all uppercase">返回首頁</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white h-screen overflow-hidden">
      <ExamHeader title={isCorrectionMode ? `六階優化: ${currentSection.title}` : currentSection.title} progress={progress} onExit={rebootSystem} />

      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        <div className={`lg:w-1/2 p-12 overflow-y-auto border-r border-white/5 ${isCorrectionMode ? 'bg-amber-900/5' : 'bg-slate-900/40'}`}>
          <div className="space-y-10">
            <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded">{currentSection.subtitle}</div>
            <h3 className="text-4xl font-black leading-tight italic tracking-tighter">{currentPart.title}</h3>
            <div className="glass p-10 rounded-[2rem] border border-white/5 text-slate-300 leading-relaxed font-medium text-lg italic shadow-2xl relative">
              <div className="absolute top-4 right-6 opacity-5 text-4xl"><i className="fa-solid fa-quote-right"></i></div>
              {currentPart.passage || currentPart.description}
            </div>
            
            {currentSection.id === 'section-3' && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">AI 核心引擎切換</span>
                 <div className="flex space-x-2">
                   <button onClick={() => setAiProvider('gemini')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all ${aiProvider === 'gemini' ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}>GEMINI 3 FLASH</button>
                   <button onClick={() => setAiProvider('groq')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all ${aiProvider === 'groq' ? 'bg-purple-600 text-white border-purple-400 shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}>GROQ (LLAMA 3.3)</button>
                 </div>
                 {aiProvider === 'groq' && !process.env.GROQ_API_KEY && (
                   <p className="text-[10px] text-rose-500 font-black animate-pulse uppercase"><i className="fa-solid fa-triangle-exclamation mr-1"></i> 未偵測到 Groq Key，請先於環境變數配置。</p>
                 )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/2 p-12 overflow-y-auto bg-slate-950/50">
          <div className="max-w-xl mx-auto space-y-12 pb-48">
            {currentPart.questions.map(q => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                selectedAnswer={state.answers[q.id]} 
                onAnswerChange={(ans) => handleAnswer(q.id, ans)} 
                disabled={state.isSubmitted && !isCorrectionMode}
                isCorrectionMode={isCorrectionMode}
                selectedTopicIndex={state.selectedTopicIndex}
                onSelectTopic={handleSelectTopic}
                aiTutorFeedback={q.type === 'WRITING' ? aiFeedback : undefined}
                isReanalyzing={q.type === 'WRITING' ? isReanalyzing : false}
                onAdoptCorrection={q.type === 'WRITING' ? handleAdoptCorrection : undefined}
                hasCorrectionAvailable={q.type === 'WRITING' ? !!extractedCorrectedVersion : false}
                correctedTranslation={q.type === 'WRITING' ? extractedTranslation : undefined}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 glass border-t p-8 z-[999] flex items-center justify-between transition-colors ${isCorrectionMode ? 'border-amber-500/30' : 'border-white/10'}`}>
        <button onClick={prevPart} disabled={state.currentSectionIndex === 0 && state.currentPartIndex === 0} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-5 transition-all">上一個部分</button>
        <div className="flex space-x-4">
          {isCorrectionMode && currentSection.id === 'section-3' && (
            <button onClick={handleReanalyze} disabled={isReanalyzing} className="px-8 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black hover:bg-amber-400 transition-all text-xs tracking-widest uppercase flex items-center shadow-lg shadow-amber-500/10">
              {isReanalyzing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>} 檢查當前修正
            </button>
          )}
          {state.currentSectionIndex === JAE_ENGLISH_2025.length - 1 && state.currentPartIndex === currentSection.parts.length - 1 ? (
            <button 
              onClick={submitExam} 
              disabled={isProcessingSubmit || (state.selectedTopicIndex === null && currentSection.id === 'section-3')} 
              className={`px-12 py-4 rounded-2xl font-black transition-all text-xs tracking-widest uppercase shadow-lg ${state.selectedTopicIndex === null && currentSection.id === 'section-3' ? 'bg-slate-800 text-slate-500' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'}`}
            >
              {isProcessingSubmit ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null} 送出答案與診斷
            </button>
          ) : (
            <button onClick={nextPart} className="px-12 py-4 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 transition-all text-xs tracking-widest uppercase">下一個部分</button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
