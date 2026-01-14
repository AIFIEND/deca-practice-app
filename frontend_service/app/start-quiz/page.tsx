// app/start-quiz/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // <--- IMPORT SESSION
import { apiFetch, postJson } from "@/lib/api"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function StartQuizPage() {
  const router = useRouter();
  const { data: session } = useSession(); // <--- GET SESSION
  const token = (session?.user as any)?.backendToken; // <--- EXTRACT TOKEN

  const [config, setConfig] = useState<{
    categories: string[];
    difficulties: string[];
  } | null>(null);

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedDiffs, setSelectedDiffs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // 1. Load available categories/difficulties
  useEffect(() => {
    // This endpoint is public, so no token needed
    apiFetch("/api/quiz-config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load config", err);
        setLoading(false);
      });
  }, []);

  // 2. Handle Start
  const handleStart = async () => {
    if (!token) {
        alert("You must be logged in to start a quiz.");
        return;
    }
    setStarting(true);
    try {
      // Pass the token in the headers explicitly
      const res = await postJson("/api/quiz/start", {
        categories: selectedCats,
        difficulties: selectedDiffs,
        testName: "Custom Practice",
      }, {
        headers: { "Authorization": `Bearer ${token}` } // <--- ATTACH TOKEN
      });

      router.push(`/practice?attemptId=${res.attemptId}`);
} catch (err: any) {
      console.error("Failed to start quiz", err);
      // NEW: Show the error to the user
      alert(`Error starting quiz: ${err.message}`);
      setStarting(false);
    }
  };

  if (loading) return <div className="p-8">Loading configuration...</div>;
  if (!config) return <div className="p-8">Error loading config.</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Start a Practice Quiz</CardTitle>
          <CardDescription>Select your preferences below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Categories */}
          <div className="space-y-2">
            <h3 className="font-semibold">Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {config.categories.map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={selectedCats.includes(cat)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedCats([...selectedCats, cat]);
                      else setSelectedCats(selectedCats.filter((c) => c !== cat));
                    }}
                  />
                  <Label htmlFor={`cat-${cat}`}>{cat}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulties */}
          <div className="space-y-2">
            <h3 className="font-semibold">Difficulties</h3>
            <div className="flex flex-wrap gap-4">
              {config.difficulties.map((diff) => (
                <div key={diff} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diff-${diff}`}
                    checked={selectedDiffs.includes(diff)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedDiffs([...selectedDiffs, diff]);
                      else setSelectedDiffs(selectedDiffs.filter((d) => d !== diff));
                    }}
                  />
                  <Label htmlFor={`diff-${diff}`}>{diff}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleStart} 
            disabled={starting} 
            className="w-full"
          >
            {starting ? "Starting..." : "Start Quiz"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
