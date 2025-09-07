import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import QuizClient from "@/components/QuizClient"; 

interface ResumePageProps {
  // params is now a Promise you must await
  params: Promise<{ id: string }>;
}

export default async function ResumePage({ params }: ResumePageProps) {
  // 1️⃣ Wait for Next.js to resolve the dynamic params
  const { id } = await params;

  // 2️⃣ Fetch your saved quiz
  const session = await getServerSession(authOptions);
  if (!session?.user?.backendToken) {
    return <p>Please log in to continue your quiz.</p>;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quiz/resume/${id}`,
    {
      headers: { Authorization: `Bearer ${session.user.backendToken}` },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    return <p>Error loading quiz: {res.statusText}</p>;
  }
  const { questions, answersSoFar } = await res.json();

  // 3️⃣ Render using the now‑ready id
  return (
    <QuizClient
      attemptId={Number(id)}
      questions={questions}
      initialAnswers={answersSoFar}
    />
  );
}
