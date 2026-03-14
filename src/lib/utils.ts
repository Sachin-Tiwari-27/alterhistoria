import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
