'use client';
import LoginForm from '@/components/authentication-02';
import Image from 'next/image';
import React, { useState } from 'react';
import MapViewImage from '@/../public/map-view.webp';
import { AnimatePresence, motion } from 'framer-motion';
import WaitForAuth from '@/components/wait-for-auth';

const App: React.FC = () => {
    const [emailSent, setEmailSent] = useState(false);
    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center">
            <AnimatePresence>
                <motion.div
                    className="absolute top-0 left-0 h-full w-full backdrop-blur-sm -z-10"
                    key={'backdrop'}
                    layout
                    transition={{
                        duration: 1,
                        ease: 'anticipate',
                        repeat: 0,
                        delay: 0.2,
                    }}
                    animate={{
                        background: [
                            'radial-gradient(circle at bottom, rgba(0,0,0,1) 100%, rgba(0,0,0,0.8) 100%)',
                            'radial-gradient(circle at bottom, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.8) 100%)',
                        ],
                    }}
                    exit={{
                        background: 'transparent',
                        opacity: 0,
                        transition: {
                            duration: 1,
                            delay: 0,
                        },
                        display: 'none',
                    }}
                />
            </AnimatePresence>
            <Image
                src={MapViewImage}
                alt="Background Map"
                layout="fill"
                objectFit="cover"
                quality={100}
                className="absolute inset-0 -z-20"
                priority
                // style={{ filter: 'blur(4px)' }}
            />
            <div className="w-full">
                <AnimatePresence mode="wait">
                    {!emailSent ? (
                        <motion.div
                            key="loginForm"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            transition={{
                                type: 'spring',
                                stiffness: 100,
                                damping: 10,
                                duration: 0.5,
                            }}
                        >
                            <LoginForm
                                onEmailSent={() => {
                                    setEmailSent(true);
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="waitForAuth"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{
                                type: 'spring',
                                stiffness: 100,
                                damping: 10,
                                duration: 0.5,
                            }}
                        >
                            <WaitForAuth />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default App;
