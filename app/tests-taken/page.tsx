import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TestsTakenClient } from "./_components/tests-taken-client";

type ApiTest = {
  id: number;
  test_name: string;
  score: number;
  total_questions: number;
  timestamp: string;
  is_complete: boolean;               // ← include this
};

type Test = {
  _id: string;
  testName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  is_complete: boolean;               // ← forward it
};

async function getTestsTaken(): Promise<Test[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.backendToken) {
    console.log("No session or backend token found.");
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.user.backendToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch test attempts: ${response.statusText}`
      );
    }

    const data: ApiTest[] = await response.json();

    return data.map((t) => ({
      _id: t.id.toString(),
      testName: t.test_name,
      score: t.score,
      totalQuestions: t.total_questions,
      completedAt: t.timestamp,
      is_complete: t.is_complete,
    }));
  } catch (error) {
    console.error("Could not fetch test attempts:", error);
    return [];
  }
}

export default async function TestsTakenPage() {
  const tests = await getTestsTaken();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tests Taken</h1>
      <TestsTakenClient tests={tests} />
    </div>
  );
}
