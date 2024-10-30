import { cn } from '@/lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

type Props = {
    isVisible: boolean;
    backButtonAction?: () => void;
    children: ReactNode;
};

export default function Sidebar(props: Props) {
    return (
        <AnimatePresence>
            {props.isVisible && (
                <motion.div
                    className={cn(
                        'absolute flex flex-col top-16 right-0 bottom-0 pointer-events-none py-4 pr-4 z-50 w-full max-w-72 lg:max-w-96'
                    )}
                    layout
                    transition={{
                        type: 'spring',
                        duration: 0.5,
                        bounce: 0.2,
                        velocity: 0,
                    }}
                    initial={{ translateX: '100%' }}
                    animate={{ translateX: '0%' }}
                    exit={{ translateX: '100%' }}
                >
                    <div className="rounded-3xl shadow-3xl flex flex-col w-full max-w-72 lg:max-w-96 h-full bg-white/60 border-2 border-white/30 backdrop-blur-2xl pointer-events-auto">
                        <div className="py-4 text-black space-y-4 flex flex-col max-h-full overflow-hidden">
                            {props.backButtonAction && (
                                <div
                                    className="flex-0 flex flex-row gap-2 px-6 pointer-events-auto"
                                    onClick={props.backButtonAction}
                                >
                                    <ArrowLeftIcon
                                        className={cn('w-5')}
                                        aria-hidden="true"
                                    />
                                    <p className="text-sm">Back</p>
                                </div>
                            )}
                            <h1 className="flex-0 text-2xl px-6 font-bold uppercase text-primary">
                                Building Insights
                            </h1>
                            <div className="flex-1 overflow-auto">
                                {props.children}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
