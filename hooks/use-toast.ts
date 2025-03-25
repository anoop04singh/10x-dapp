"use client"

// This is a simplified version of the toast hook
// In a real app, you would use the shadcn/ui toast component

import { useState } from "react"

type ToastVariant = "default" | "destructive"

interface ToastProps {
  title: string
  description: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    // In a real implementation, this would show a toast notification
    // For this demo, we'll just log to console
    console.log(`[${variant.toUpperCase()}] ${title}: ${description}`)

    // Add toast to state
    const newToast = { title, description, variant }
    setToasts((prev) => [...prev, newToast])

    // Remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast))
    }, 3000)
  }

  return { toast, toasts }
}

