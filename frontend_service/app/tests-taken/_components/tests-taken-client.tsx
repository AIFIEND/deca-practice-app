"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Test = {
  _id: string;
  testName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  is_complete: boolean; // Field is used to show Continue button
};

interface TestsTakenClientProps {
  tests: Test[];
}

// Helper to parse and format the ISO timestamp
function formatDate(isoString: string): string {
  // Ensures 'Z' for UTC if missing, preventing local time conversion issues
  const str = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
  const d = new Date(str);
  if (isNaN(d.getTime())) return "—"; // Return dash for invalid dates
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const TestsTakenClient = ({ tests }: TestsTakenClientProps) => {
  const router = useRouter();

  if (tests.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">No Tests Taken Yet</h2>
        <p className="text-muted-foreground mt-2">
          Start a new practice quiz to see your results here.
        </p>
        <Button onClick={() => router.push('/start-quiz')} className="mt-4">
          Start a Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tests.map((test) => (
        <Card key={test._id}>
          <CardHeader>
            <CardTitle>{test.testName}</CardTitle>
            <CardDescription>
              Started on: {formatDate(test.completedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {test.is_complete ? (
              <div>
                <p className="font-semibold">Score: {test.score ?? 'N/A'}%</p>
                <p className="text-sm text-muted-foreground">
                  {test.totalQuestions} questions
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">In Progress...</p>
                <Button onClick={() => router.push(`/practice?attemptId=${test._id}`)}>
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};