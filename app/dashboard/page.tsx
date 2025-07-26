import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Welcome to your dashboard! From here you can start a new practice quiz.</p>

      <div className="mt-6">
        <Link href="/start-quiz">
          <Button size="lg">Start a New Quiz</Button>
        </Link>
      </div>
    </div>
  );
}