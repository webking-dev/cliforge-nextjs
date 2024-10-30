import React from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Branding from './branding';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import {
	ChevronDown,
	LogOut,
	ReceiptText,
	Ticket,
	User,
	Users,
} from 'lucide-react';

export default function MainMenu() {
	const signOutAction = () => {
		console.debug('Sign out clicked');
		signOut();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div
					className={cn(
						'rounded-xl px-2 py-1',
						'focus:bg-white bg-white/90 hover:bg-white/100 data-[state=open]:bg-white/100',
						'border-4 border-primary/10 hover:border-primary/20 data-[state=open]:border-primary/100',
						'flex flex-row items-center'
					)}
				>
					<Branding />
					<ChevronDown className='w-4 h-4 ml-2' />
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled>
					<User className='w-4 h-4 mr-2' />
					Profile
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					<ReceiptText className='w-4 h-4 mr-2' />
					Billing
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					<Users className='w-4 h-4 mr-2' /> Team
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					<Ticket className='w-4 h-4 mr-2' /> Subscription
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={signOutAction}
					className='text-red-500 focus:bg-red-100 focus:text-red-500'
				>
					<LogOut className='w-5 h-5 mr-2 stroke-red-400' />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
