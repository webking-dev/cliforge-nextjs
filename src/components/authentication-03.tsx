import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Branding from './branding';
import { signIn } from 'next-auth/react';

type Props = {
    onShowSignin: () => void;
    onEmailSent: () => void;
};
export default function SignupForm(props: Props) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // You can add any client-side validation here if necessary
        const form = e.currentTarget as HTMLFormElement;
        const email = form.email.value;
        const firstName = form['first-name'].value;
        const lastName = form['last-name'].value;

        // TOFO: add a custom backend method to handle sign-up
        // Might be the only way to capture name
        // Call your backend or NextAuth sign-in method (for Magic Link)
        const res = await signIn('email', {
            email, // the email value entered by the user
            name: `${firstName} ${lastName}`, // combining first and last names
            redirect: false, // optionally disable redirect
            callbackUrl: '/', // redirect the user after sign-in
        });

        if (res?.ok) {
            // Handle success, maybe show a message or redirect
            console.log('Check your email for the magic link');
            props.onEmailSent();
        } else {
            // Handle error, show a notification or message
            console.error(res?.error);
        }
    };

    return (
        <Card className="mx-auto max-w-sm w-full  shadow-2xl bg-white/80 border-2 border-primary/50 backdrop-blur-lg">
            <CardHeader>
                <Branding className="mb-4" logoOnly />
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>
                    Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" placeholder="Max" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input
                                id="last-name"
                                placeholder="Robinson"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="anselm@climateforge.ai"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create an account
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link
                        href="#"
                        className="underline"
                        onClick={() => props.onShowSignin()}
                    >
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
