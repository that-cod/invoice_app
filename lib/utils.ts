import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strip HTML tags from free-text fields before storing.
 * Prevents XSS on the public invoice share page.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '').trim()
}
