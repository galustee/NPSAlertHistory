'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label = 'Back to Parks' }: { label?: string }) {
  const router = useRouter()

  return (
    <nav className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all duration-200 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          {label}
        </button>
      </div>
    </nav>
  )
}
