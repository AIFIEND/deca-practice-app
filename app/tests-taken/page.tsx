import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TestsTakenClient } from "./_components/tests-taken-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// This is the type for data coming directly from your Flask API
type ApiTest = {
  id: number;
  test_name: string;
  score: number;
  timestamp: string;
  total_questions: number;
  is_complete: boolean;
};

// This is the type used by your frontend components
type Test = {
  _id: string;
  testName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  is_complete: boolean;
};

// This function now runs on the server and includes the session check
async function getTestsTaken(session: any): Promise<Test[]> {
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
        cache: 'no-store', // Ensures fresh data is fetched every time
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch test attempts: ${response.statusText}`);
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

// The main page component now handles the auth check
export default async function TestsTakenPage() {
  const session = await getServerSession(authOptions);

  // If there's no session, show the access denied message
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You need to be logged in to view this page.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the user is logged in, fetch their tests and render the client component
  const tests = await getTestsTaken(session);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Tests</h1>
      <TestsTakenClient tests={tests} />
    </div>
  );
}