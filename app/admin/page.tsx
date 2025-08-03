// app/admin/page.tsx
// UPDATED: The fetch URL now correctly points to the backend API.

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminGatePage() {
    const router = useRouter();
    const [passcode, setPasscode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // UPDATED: The URL now uses the environment variable to point to the backend.
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-passcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode }),
            });

            if (res.ok) {
                toast.success("Access granted!");
                router.push('/admin/dashboard');
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to verify passcode.");
            }
        } catch (error) {
            console.error("Failed to verify passcode:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Admin Access</CardTitle>
                    <CardDescription>Please enter the admin passcode to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="passcode">Passcode</Label>
                            <Input
                                id="passcode"
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Enter'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}