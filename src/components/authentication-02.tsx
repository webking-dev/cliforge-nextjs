'use client';
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
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Branding from './branding';
import SignupForm from './authentication-03';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
    onEmailSent: () => void;
};

export default function LoginForm(props: Props) {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [showSignup, setShowSignup] = useState(false);
    const signinAction = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const email = form.email.value;
        //TODO: Blur/drop focus on the email input field
        try {
            setLoading(true);
            await signIn('email', {
                email,
                callbackUrl: '/', // URL to redirect after successful sign-in
                redirect: false, // Prevent default redirect behavior
            });
            setEmailSent(true);
            props.onEmailSent();
        } catch (error) {
            console.error(error);
            setError('An error occurred while signing in');
        }
    };
    const variants = {
        hidden: { opacity: 0, y: -50, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { type: 'spring', bounce: 0.5 },
        },
    };

    return (
        <AnimatePresence mode="wait">
            {!showSignup ? (
                <motion.div
                    key="login"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={variants}
                >
                    <Card className="mx-auto w-full max-w-sm shadow-2xl bg-white/80 border-2 border-primary/50 backdrop-blur-lg">
                        <CardHeader>
                            <Branding className="mb-4" logoOnly />
                            <CardTitle className="text-2xl">
                                Login to ClimateForge
                            </CardTitle>
                            <CardDescription>
                                Login with your work Email ID
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={signinAction}
                                autoComplete={
                                    loading || emailSent ? 'off' : 'email'
                                }
                            >
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type={'email'}
                                            placeholder="anselm@climateforge.ai"
                                            required
                                            disabled={emailSent || loading}
                                            aria-disabled={emailSent || loading}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-primary"
                                        disabled={emailSent || loading}
                                        aria-disabled={emailSent || loading}
                                    >
                                        Login
                                    </Button>
                                </div>
                            </form>
                            <div className="mt-4 text-center text-sm">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href="#"
                                    className="underline"
                                    onClick={() => setShowSignup(true)}
                                >
                                    Sign up
                                </Link>
                            </div>
                            {error && (
                                <div className="mt-4 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    key="signup"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={variants}
                >
                    <SignupForm
                        onShowSignin={() => setShowSignup(false)}
                        onEmailSent={() => props.onEmailSent()}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
