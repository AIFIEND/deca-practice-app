// app/tests-taken/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TestsTakenClient } from "./_components/tests-taken-client";

type ApiTest = {
  id: number;
  testName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
};

async function getTestsTaken(): Promise<ApiTest[]> {
  const session = await getServerSession(authOptions);

  // If there's no session or no backendToken, we can't authenticate.
  if (!session?.user?.backendToken) {
    console.log("No session or backend token found.");
    return [];
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts`, {
      method: 'GET',
      headers: {
        // Send the token in the Authorization header
        'Authorization': `Bearer ${session.user.backendToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch test attempts: ${response.statusText}`);
    }

    const data: ApiTest[] = await response.json();
    return data;

  } catch (error) {
    console.error("Could not fetch test attempts:", error);
    return [];
  }
}


export default async function TestsTakenPage() {
  const testsData = await getTestsTaken();

  const formattedTests = testsData.map(test => ({
    ...test,
    _id: test.id.toString(),
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tests Taken</h1>
      <TestsTakenClient tests={formattedTests} />
    </div>
  );
}