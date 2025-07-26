// app/start-quiz/page.tsx

'use client'; // This component is interactive, so it's a client component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function StartQuizPage() {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allDifficulties, setAllDifficulties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  const approvedCategories = [
    'Business Law', 'Communication Skills', 'Customer Relations', 'Economics',
    'Emotional Intelligence', 'Entrepreneurship', 'Financial Analysis',
    'Financial Management', 'Human Resources Management', 'Information Management',
    'Marketing', 'Operations', 'Professional Development', 'Risk Management', 'Strategic Management'
  ];

  // Fetch the config data from the API when the page loads
  useEffect(() => {
    async function fetchConfig() {
      try {
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz-config`);        const data = await res.json();
        // Filter the categories from the API against our approved list
        setAllCategories(data.categories.filter((cat: string) => approvedCategories.includes(cat)));
        setAllDifficulties(data.difficulties);
      } catch (error) {
        console.error("Failed to fetch quiz config:", error);
      }
    }
    fetchConfig();
  }, []); // Empty dependency array means this runs once on mount

  const handleCheckboxChange = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter(item => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleStartQuiz = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.append('categories', selectedCategories.join(','));
    }
    if (selectedDifficulties.length > 0) {
      params.append('difficulties', selectedDifficulties.join(','));
    }
    router.push(`/practice?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Start a New Practice Quiz</CardTitle>
          <CardDescription>Select filters to customize your quiz. Leave blank to include all questions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {allCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    onCheckedChange={() => handleCheckboxChange(category, selectedCategories, setSelectedCategories)}
                  />
                  <Label htmlFor={`cat-${category}`} className="capitalize">{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Difficulties</h3>
            <div className="grid grid-cols-2 gap-4">
              {allDifficulties.map(difficulty => (
                <div key={difficulty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diff-${difficulty}`}
                    onCheckedChange={() => handleCheckboxChange(difficulty, selectedDifficulties, setSelectedDifficulties)}
                  />
                  <Label htmlFor={`diff-${difficulty}`} className="capitalize">{difficulty}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleStartQuiz} className="w-full" size="lg">
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}