import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isStatusOK(status: number) {
    return status >= 200 && status < 300;
}

export function transformToCSV(data: object[]) {
    const csv = data.map((d) => Object.values(d).join(',')).join('\n');

    const heading = Object.keys(data[0]).join(',') + '\n';
    return heading + csv;
}
