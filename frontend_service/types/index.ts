export interface Question {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
}