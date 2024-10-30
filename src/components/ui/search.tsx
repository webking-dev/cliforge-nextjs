
"use client";
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { LoadingSpinner } from '@/components/loading-spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, ReactNode } from 'react';

const boxAnimation1 = {
	initial: {
		y: '-50%',
		opacity: 0,
		scale: 0.5,
	},
	animate: {
		y: 0,
		opacity: 1,
		scale: 1,
	},
	exit: {
		y: '-50%',
		opacity: 0,
		scale: 0.5,
		transition: { duration: 0.2 },
	},
	transition: {
		duration: 0.5,
		ease: 'anticipate',
	},
};

const boxAnimation2 = {
	initial: {
		y: '50%',
		opacity: 0,
		scale: 0.5,
	},
	animate: {
		y: 0,
		opacity: 1,
		scale: 1,
	},
	exit: {
		y: '50%',
		opacity: 0,
		scale: 0.5,
		transition: { duration: 0.2 },
	},
	transition: {
		duration: 0.5,
		ease: 'anticipate',
	},
};

type SearchProps = {
    searchQuery?: string;
    placeholderText: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined
    children?: ReactNode;
}


export default function Search({ 
        searchQuery,
        placeholderText,
        onChange,
        children
    }: SearchProps) {
        const [inputInFocus, setInputInFocus] = useState(false);
    return (
        <Popover open={inputInFocus}>
			<PopoverTrigger asChild>
				<div
					className={cn(
						'relative h-full w-80 self-stretch flex items-center',
						'rounded-xl border-4 border-primary/10 hover:border-primary/20 hover:bg-white',
						'bg-white/90'
					)}
				>
					<Input
						className='bg-transparent flex-1 h-full px-4 py-2 pl-3 pr-10 peer focus-visible:ring-4 focus-visible:ring-primary rounded-xl border-0'
						placeholder=' '
						onChange={onChange}
						onFocus={() => setInputInFocus(true)}
                        onBlur={() => setInputInFocus(false)}
						value={searchQuery}
					/>
					<div className='hidden peer-placeholder-shown:flex pointer-events-none absolute left-0 top-0 right-0 bottom-0 pl-4 h-full items-stretch'>
						<div className='flex flex-1 flex-row items-center gap-1'>
							<div className='text-sm text-muted-foreground'>
								{placeholderText}
							</div>
							<SparklesIcon className='h-4 w-4 text-primary/40' />
						</div>
						<div className='flex-0'>
							<AnimatePresence>
								{!inputInFocus && (
									<motion.div
										key='searchIconMotion'
										className='h-full w-10 p-0 self-stretch'
										{...boxAnimation1}
									>
										<Button
											variant='ghost'
											className={cn(
												'h-full w-full p-0 flex items-center justify-center pointer-events-auto rounded-xl',
												'hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors'
											)}
										>
											<MagnifyingGlassIcon className='h-5 w-5 stroke-2' />
										</Button>
									</motion.div>
								)}
								{inputInFocus && (
									<motion.div
										key='loadingSpinnerMotion'
										className='h-full w-10 p-0 self-stretch'
										{...boxAnimation2}
									>
										<div
											className={cn(
												'h-full w-full flex items-center justify-center pointer-events-auto cursor-progress',
												'rounded-xl hover:bg-muted hover:text-muted-foreground text-muted-foreground transition-colors'
											)}
										>
											<LoadingSpinner className='h-5 w-5' />
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</PopoverTrigger>
			
            {children ? 
                <PopoverContent
                    className='px-0'
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    {children}
                </PopoverContent> 
            : null
            }

		</Popover>
    );
}