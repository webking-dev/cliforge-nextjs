'use client';
import useAppStateStore from '@/lib/stores/appStateStore';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import MainMenu from './header-main-menu';
import MapSearch from './map-search';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const isHeaderExpanded = useAppStateStore(
        (state) => state.isHeaderExpanded
    );

    return (
        <motion.div
            layout
            key={'header'}
            className={cn(
                'fixed top-0 left-0 z-50',
                isHeaderExpanded && 'bottom-0 right-0',
                isHeaderExpanded && 'pt-72'
            )}
        >
            <header className={cn('flex flex-col items-center')}>
                <AnimatePresence>
                    {isHeaderExpanded && (
                        <motion.div
                            className="absolute top-0 left-0 h-full w-full backdrop-blur-sm"
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
                                    'radial-gradient(circle at bottom, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 100%)',
                                    'radial-gradient(circle at bottom, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)',
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
                    )}
                    <motion.div
                        className="flex"
                        layout
                        key="nav-wrapper"
                        transition={{
                            type: 'spring',
                            duration: 1,
                            bounce: 0.5,
                            velocity: 0,
                            delay: 1,
                            layout: {
                                type: 'spring',
                                duration: 1,
                                bounce: 0.2,
                                velocity: 1,
                            },
                        }}
                        initial={{
                            opacity: 0,
                            scale: 0.5,
                            y: -50,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                    >
                        <nav
                            className={cn(
                                'flex-0 flex flex-col sm:flex-row flex-wrap items-stretch justify-center',
                                'px-2 py-1 mx-4 mt-1 rounded-2xl sm:gap-4',
                                'border-2',
                                usePathname() === '/'
                                    ? 'backdrop-blur-2xl bg-white/60 shadow-2xl border-white/30'
                                    : 'bg-primary/10 shadow-lg border-primary/0'
                            )}
                        >
                            <MainMenu />
                            <MapSearch />
                            <AnimatePresence mode="wait">
                                {usePathname() !== '/' && (
                                    <motion.div
                                        key="find-leads"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-stretch"
                                    >
                                        <Link
                                            href="/"
                                            className={cn(
                                                'rounded-xl px-4 py-1',
                                                'focus:bg-white bg-white/90 hover:bg-white/100 data-[state=open]:bg-white/100',
                                                'border-4 border-primary/10 hover:border-primary/20 data-[state=open]:border-primary/100',
                                                'flex flex-row items-center'
                                            )}
                                        >
                                            <div>Find Leads</div>
                                        </Link>
                                    </motion.div>
                                )}
                                {usePathname() !== '/dashboard' && (
                                    <motion.div
                                        key="dashboard"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-stretch"
                                    >
                                        <Link
                                            href="/dashboard"
                                            className={cn(
                                                'rounded-xl px-4 py-1',
                                                'focus:bg-white bg-white/90 hover:bg-white/100 data-[state=open]:bg-white/100',
                                                'border-4 border-primary/10 hover:border-primary/20 data-[state=open]:border-primary/100',
                                                'flex flex-row items-center'
                                            )}
                                        >
                                            <div>Dashboard</div>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </nav>
                    </motion.div>
                    {isHeaderExpanded && (
                        <motion.div
                            className="mt-36 flex flex-col items-center justify-center bg-white/10  backdrop-blur-lg text-center px-8 py-4 rounded-xl text-white/80 border-2 border-white/40"
                            layout
                            key="search-suggestions"
                            transition={{
                                type: 'spring',
                                duration: 2,
                                bounce: 0.2,
                                velocity: 0,
                                delay: 3,
                            }}
                            initial={{
                                opacity: 0,
                                scale: 0.7,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.7,
                                transition: {
                                    duration: 0.5,
                                    delay: 0,
                                },
                            }}
                        >
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                    Try searching for
                                </h3>
                                <Separator className="bg-white/40" />
                                <div className="flex flex-col items-stretch">
                                    <Button variant="ghost" size="lg" disabled>
                                        Layman St, Chicago
                                    </Button>
                                    <Separator className="bg-white/20" />
                                    <Button variant="ghost" size="lg" disabled>
                                        Cliff St, NY
                                    </Button>
                                    <Separator className="bg-white/20" />
                                    <Button variant="ghost" size="lg" disabled>
                                        Parker Ave, SF
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </motion.div>
    );
}
