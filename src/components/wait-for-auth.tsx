import { Activity } from 'lucide-react';
import Branding from './branding';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from './ui/card';
import { LoadingSpinner } from './loading-spinner';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function WaitForAuth() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/');
        }
    }, [status, router]);

    return (
        <Card className="mx-auto w-full max-w-sm shadow-2xl bg-white/80 border-2 border-primary/50 backdrop-blur-lg">
            <CardHeader>
                <Branding className="mb-4" logoOnly />
                <CardTitle className="text-2xl">Check your Email</CardTitle>
                <CardDescription>
                    Click on the sign-in link in your email
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoadingSpinner className="" />
            </CardContent>
        </Card>
    );
}
