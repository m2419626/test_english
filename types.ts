
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
  correctAnswer?: string; // e.g., 'A', 'B', 'C', 'D' or the word for FILL
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

/**
 * Represents a specific part of an exam section.
 * Added 'description' property to support instructional text in parts like Section 3 Writing.
 */
export interface ExamPart {
  id: string;
  title: string;
  passage?: string;
  description?: string;
  image?: string;
  questions: Question[];
}

export interface UserAnswer {
  questionId: string;
  answer: string;
}

export interface ExamState {
  currentSectionIndex: number;
  currentPartIndex: number;
  answers: Record<string, string>;
  isSubmitted: boolean;
}
