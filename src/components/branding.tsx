import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import Logo from '@/../public/logo.png';

type Props = {
	logoOnly?: boolean;
	className?: string;
};

export default function Branding(props: Props) {
	return (
		<div className={cn('flex flex-row items-center gap-3', props.className)}>
			<Image src={Logo} alt='DogLeads Logo' width={40} height={40} priority />
			{!props.logoOnly && (
				<h1
					className={cn(
						`pointer-events-none sm:pointer-events-auto text-foreground text-lg font-semibold`
					)}
				>
					ClimateForge
				</h1>
			)}
		</div>
	);
}
