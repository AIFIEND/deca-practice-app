// app/admin/dashboard/_components/admin-dashboard-client.tsx
// UPDATED: Fixed TypeScript errors by defining types locally and adding explicit type annotations.

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// NEW: Define types directly in the client component to avoid import issues.
type UserAnalytics = {
    id: number;
    username: string;
    quiz_count: number;
    average_score: number;
};

type PerformanceByCategory = {
    correct: number;
    total: number;
};

type AdminAnalyticsData = {
    total_quizzes_taken: number;
    average_score_all_users: number;
    performance_by_category: Record<string, PerformanceByCategory>;
    user_analytics: UserAnalytics[];
};

interface AdminDashboardClientProps {
    data: AdminAnalyticsData;
}

export const AdminDashboardClient = ({ data }: AdminDashboardClientProps) => {
    const { total_quizzes_taken, average_score_all_users, performance_by_category, user_analytics } = data;

    // UPDATED: Added explicit type annotation for the destructured parameter.
    const categoryData = Object.entries(performance_by_category).map(([category, { correct, total }]: [string, PerformanceByCategory]) => ({
        name: category,
        'Accuracy (%)': total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => a['Accuracy (%)'] - b['Accuracy (%)']); // Sort from worst to best

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quizzes Taken</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total_quizzes_taken}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{average_score_all_users?.toFixed(1) ?? 'N/A'}%</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user_analytics.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance By Category (All Users)</CardTitle>
                    <CardDescription>The most difficult categories across the platform, sorted by lowest accuracy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} tick={{fontSize: 12}} />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip formatter={(value: number) => `${value}%`} />
                            <Legend />
                            <Bar dataKey="Accuracy (%)" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User Leaderboard</CardTitle>
                    <CardDescription>Users sorted by their average score across all quizzes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead className="text-right">Quizzes Taken</TableHead>
                                <TableHead className="text-right">Average Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* UPDATED: Added explicit types for sort and map parameters. */}
                            {user_analytics.sort((a: UserAnalytics, b: UserAnalytics) => b.average_score - a.average_score).map((user: UserAnalytics) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell className="text-right">{user.quiz_count}</TableCell>
                                    <TableCell className="text-right">{user.average_score.toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
