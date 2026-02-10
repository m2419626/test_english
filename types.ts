
export type QuestionType = 'MCQ' | 'FILL' | 'WRITING';

export interface Option {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  questionText?: string;
  options?: Option[];
  correctAnswer?: string;
  marks: number;
}

export interface ExamSection {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  passage?: string;
  parts: ExamPart[];
}

export interface ExamPart {
  id: string;
  title: string;
  passage?: string;
  description?: string;
  image?: string;
  questions: Question[];
}

export interface ExamState {
  currentSectionIndex: number;
  currentPartIndex: number;
  answers: Record<string, string>;
  selectedTopicIndex: number | null; // 新增：紀錄寫作題目編號 (0, 1, 2)
  isSubmitted: boolean;
}
