// app/tests-taken/page.tsx

import { TestsTakenClient } from "./_components/tests-taken-client";

// Example data for the tests taken
const exampleTests = [
  {
    _id: "1",
    testName: "Marketing Cluster Exam",
    score: 85,
    totalQuestions: 100,
    completedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    testName: "Finance Cluster Exam",
    score: 92,
    totalQuestions: 100,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    _id: "3",
    testName: "Hospitality & Tourism Cluster Exam",
    score: 78,
    totalQuestions: 100,
    completedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
];


export default function TestsTakenPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tests Taken</h1>
      <TestsTakenClient tests={exampleTests} />
    </div>
  );
}