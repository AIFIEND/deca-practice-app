// app/tests-taken/_components/tests-taken-client.tsx

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define a type for the test data for better type safety
type Test = {
  _id: string;
  testName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
};

interface TestsTakenClientProps {
  tests: Test[];
}

export const TestsTakenClient = ({ tests }: TestsTakenClientProps) => {
  if (tests.length === 0) {
    return (
      <p className="text-muted-foreground">You have not taken any tests yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => (
        <Card key={test._id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{test.testName}</CardTitle>
            <CardDescription>
              Completed on: {new Date(test.completedAt).toLocaleDateString()}
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
        </Card>
      ))}
    </div>
  );
};