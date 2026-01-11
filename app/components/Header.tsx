'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { NAV_STYLES, CONTAINER_STYLES } from '@/lib/constants'

interface HeaderProps {
  subtitle?: string
  showActivityFeedLink?: boolean
}

export default function Header({ subtitle, showActivityFeedLink = true }: HeaderProps) {
  return (
    <nav className={NAV_STYLES.base}>
      <div className={CONTAINER_STYLES.centered + ' py-4 flex items-center justify-between'}>
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            LandLog.io
          </h1>
        </Link>
        <div className="flex items-center gap-6">
          {showActivityFeedLink && (
            <Link 
              href="/feed"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Activity Feed
            </Link>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            {subtitle || 'Historical alert timelines for U.S. National Parks'}
          </p>
        </div>
      </div>
    </nav>
  )
}
