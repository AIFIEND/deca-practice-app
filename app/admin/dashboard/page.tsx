// app/admin/dashboard/page.tsx
// NEW FILE: Server component for the admin dashboard. Fetches and displays platform analytics.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminDashboardClient } from "./_components/admin-dashboard-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Types for admin analytics data
export type AdminAnalyticsData = {
    total_quizzes_taken: number;
    average_score_all_users: number;
    performance_by_category: Record<string, { correct: number; total: number }>;
    user_analytics: {
        id: number;
        username: string;
        quiz_count: number;
        average_score: number;
    }[];
};

async function getAdminAnalytics(session: any): Promise<AdminAnalyticsData | null> {
    if (!session?.user?.backendToken) return null;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${session.user.backendToken}` },
            cache: 'no-store',
        });
        if (!response.ok) throw new Error("Failed to fetch admin analytics");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.is_admin) {
        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const analyticsData = await getAdminAnalytics(session);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            {analyticsData ? (
                <AdminDashboardClient data={analyticsData} />
            ) : (
                <p>Could not load admin analytics.</p>
            )}
        </div>
    );
}