import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges css class names.
 *
 * @param {...ClassValue[]} inputs - CSS class names to be combined and merged.
 * @returns {string} - A string of merged css class names.
 *
 * @example
 * cn('bg-red-500', 'text-white', 'bg-blue-500')
 * // returns 'text-white bg-blue-500'
 *
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
