"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Test = {
  _id: string;
  testName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  is_complete: boolean;        // ← add this field
};

interface TestsTakenClientProps {
  tests: Test[];
}

// Helper to parse and format the ISO timestamp
function formatDate(isoString: string): string {
  const str = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
  const d = new Date(str);
  if (isNaN(d.getTime())) return "—";
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
      <p className="text-muted-foreground">
        You have not taken any tests yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => (
        <Card key={test._id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{test.testName}</CardTitle>
            <CardDescription>
              Completed on: {formatDate(test.completedAt)}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow flex flex-col justify-end">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Score</span>
              <Badge
                variant={test.score > 80 ? "default" : "secondary"}
                className="text-lg"
              >
                {test.score}%
              </Badge>
            </div>
          </CardContent>

          {/* Continue button for unfinished quizzes */}
          {!test.is_complete && (
            <button
              className="mt-4 btn btn-primary"
              onClick={() => router.push(`/quiz/${test._id}/resume`)}
            >
              Continue
            </button>
          )}
        </Card>
      ))}
    </div>
  );
};
