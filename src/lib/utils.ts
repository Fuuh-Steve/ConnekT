import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast alert system - to be used with useToast hook
export const createAlertSystem = (showToast: (type: string, title: string, message?: string) => void) => ({
  success: (title: string, message?: string) => showToast('success', title, message),
  error: (title: string, message?: string) => showToast('error', title, message),
  warning: (title: string, message?: string) => showToast('warning', title, message),
  info: (title: string, message?: string) => showToast('info', title, message)
});
