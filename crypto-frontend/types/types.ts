export interface Module {
  id: number;
  title: string;
  description: string;
  reward: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  chapters: Chapter[];
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  quizzes: Quiz[];
  practice: PracticeExercise[];
}

export interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number;
}

export interface PracticeExercise {
  id: number;
  title: string;
  description: string;
  reward: number;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  reward: number;
  progress: number;
}
