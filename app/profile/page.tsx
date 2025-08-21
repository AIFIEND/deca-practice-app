// app/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';


interface Attempt {
  id: number;
  score: number;
  total_questions: number;
  timestamp: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    async function fetchAttempts() {
      if (!user) return;
      try {
const res = await apiFetch('/api/user/attempts', {
  credentials: 'include',
});

        if (res.ok) {
          const data = await res.json();
          setAttempts(data);
        }
      } catch (error) {
        console.error('Failed to fetch attempts:', error);
      }
    }
    fetchAttempts();
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Profile: {user.username}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p>You haven't completed any quizzes yet.</p>
          ) : (
            <ul className="space-y-3">
              {attempts.map(attempt => (
                <li key={attempt.id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Score: {attempt.score}%</p>
                    <p className="text-sm text-muted-foreground">
                      On {attempt.total_questions} questions
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(attempt.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}