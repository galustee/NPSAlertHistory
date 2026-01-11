'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Clock, TrendingUp, TrendingDown, MapPin } from 'lucide-react'
import { BG_GRADIENT, CONTAINER_STYLES, CARD_STYLES, API_ENDPOINTS, FEED_CATEGORY_COLORS, FEED_TIMELINE_STYLES } from '@/lib/constants'
import Header from '@/app/components/Header'

interface Alert {
  id: string
  nps_alert_id: string
  title: string
  description: string
  category: string
  url: string | null
  last_updated_by_nps: string
  fetched_at: string
  is_active: boolean
  park: {
    park_code: string
    name: string
    designation: string
  }
}

interface ActivityGroup {
  date: string
  displayDate: string
  alerts: Alert[]
}

export default function FeedPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('/api/feed?limit=100')
        if (!response.ok) throw new Error('Failed to fetch feed')
        const data = await response.json()
        setAlerts(data.alerts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])

  // Group alerts by date
  const groupedAlerts: ActivityGroup[] = alerts.reduce((groups: ActivityGroup[], alert) => {
    const date = new Date(alert.fetched_at).toLocaleDateString()
    const displayDate = formatDisplayDate(alert.fetched_at)
    
    let group = groups.find(g => g.date === date)
    if (!group) {
      group = { date, displayDate, alerts: [] }
      groups.push(group)
    }
    group.alerts.push(alert)
    return groups
  }, [])

  function formatDisplayDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className={BG_GRADIENT + ' min-h-screen'}>
      {/* Header */}
      <Header subtitle="Alert Activity Feed" showActivityFeedLink={false} />

      {/* Main Content */}
      <div className={CONTAINER_STYLES.centered + ' py-12'}>
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Alert Activity Feed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Recent alert updates and changes across all national parks
          </p>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading activity feed...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Error: {error}</p>
          </div>
        ) : groupedAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedAlerts.map((group, groupIndex) => (
              <div key={group.date} className="relative">
                {/* Date header */}
                <div className={FEED_TIMELINE_STYLES.dateHeader}>
                  <div className={FEED_TIMELINE_STYLES.dateHeaderContent}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {group.displayDate}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({group.alerts.length} {group.alerts.length === 1 ? 'update' : 'updates'})
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className={FEED_TIMELINE_STYLES.verticalLine}></div>

                  {/* Alert items */}
                  <div className={FEED_TIMELINE_STYLES.alertItemContainer}>
                    {group.alerts.map((alert) => (
                      <div key={alert.id} className={FEED_TIMELINE_STYLES.cardContainer}>
                        {/* Timeline dot */}
                        <div className={`${FEED_TIMELINE_STYLES.dotBase} ${
                          alert.is_active 
                            ? FEED_TIMELINE_STYLES.dotActive
                            : FEED_TIMELINE_STYLES.dotInactive
                        }`}>
                          {alert.is_active ? (
                            <TrendingUp className="w-3 h-3 text-white" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-white" />
                          )}
                        </div>

                        {/* Alert card */}
                        <Link
                          href={`/parks/${alert.park.park_code}`}
                          className={'group ' + CARD_STYLES.base + ' ' + CARD_STYLES.hover + ' p-4 block'}
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  {formatTime(alert.fetched_at)}
                                </span>
                                {alert.category && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                    FEED_CATEGORY_COLORS[alert.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                  }`}>
                                    {alert.category}
                                  </span>
                                )}
                                {!alert.is_active && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex-shrink-0">
                                    Resolved
                                  </span>
                                )}
                              </div>
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words">
                                {alert.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {alert.park.name}
                              </p>
                            </div>
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          {alert.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
                              {alert.description}
                            </p>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 mt-20 py-8">
        <div className={CONTAINER_STYLES.centered + ' text-center text-sm text-gray-600 dark:text-gray-400'}>
          <p>
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200 font-medium cursor-pointer">
              ← Back to Parks
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
