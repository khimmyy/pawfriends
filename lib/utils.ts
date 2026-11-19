import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins Tailwind class names, letting later classes override earlier conflicting ones. Used by Reusables components. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
