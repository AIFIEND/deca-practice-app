import { redirect } from "next/navigation";

interface QuizPageProps {
  params: { id: string };
}

export default function QuizPage({ params }: QuizPageProps) {
  redirect(`/quiz/${params.id}/resume`);
}
