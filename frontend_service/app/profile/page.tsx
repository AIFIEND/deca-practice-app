// app/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJson } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Attempt {
  id: number;
  score: number;
  total_questions: number;
  timestamp: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    async function fetchAttempts() {
      if (!session?.user?.backendToken) return;
      try {
        const data = await getJson('/api/user/attempts', {
          headers: {
            Authorization: `Bearer ${session.user.backendToken}`,
          },
        });
        setAttempts(data);
      } catch (error) {
        console.error('Failed to fetch attempts:', error);
      }
    }
    fetchAttempts();
  }, [session]);

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-4">
        <p>Please log in to view your profile.</p>
        <button onClick={() => router.push('/login')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Profile: {session?.user?.name || 'User'}</h1>
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