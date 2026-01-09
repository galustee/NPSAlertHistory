'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, MapPin } from 'lucide-react'
import { BG_GRADIENT, CONTAINER_STYLES, CARD_STYLES, NAV_STYLES, API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import type { Park } from '@/lib/api'

export default function Home() {
  const [parks, setParks] = useState<Park[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState<string>('National Park')

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PARKS)
        if (!response.ok) throw new Error(ERROR_MESSAGES.FAILED_TO_FETCH_PARKS)
        const data = await response.json()
        setParks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR)
      } finally {
        setLoading(false)
      }
    }
    fetchParks()
  }, [])

  const filteredParks = parks.filter((park) => {
    const matchesSearch = park.name.toLowerCase().includes(search.toLowerCase())
    const matchesDesignation = selectedDesignation === 'all' || park.designation === selectedDesignation
    return matchesSearch && matchesDesignation
  })

  // Get unique designations for filter
  const designations = Array.from(new Set(parks.map(p => p.designation).filter(Boolean))).sort()

  return (
    <div className={BG_GRADIENT + ' min-h-screen'}>
      {/* Navigation */}
      <nav className={NAV_STYLES.base}>
        <div className={CONTAINER_STYLES.centered + ' py-4 flex items-center justify-between'}>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              NPS Alerts History
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Historical alert timelines for U.S. National Parks
          </p>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={CONTAINER_STYLES.centered + ' py-16'}>
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Track Alert History Across National Parks
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            The National Park Service provides current alerts, but we preserve the full timeline.
            See what alerts have affected each park over time.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search parks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search parks by name"
            className="w-full px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          
          <div className="flex items-center gap-3 flex-wrap">
            <label htmlFor="designation-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by type:
            </label>
            <select
              id="designation-filter"
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Types ({parks.length})</option>
              <option value="National Park">National Parks ({parks.filter(p => p.designation === 'National Park').length})</option>
              {designations.filter(d => d !== 'National Park').map(designation => (
                <option key={designation} value={designation}>
                  {designation} ({parks.filter(p => p.designation === designation).length})
                </option>
              ))}
            </select>
            {selectedDesignation !== 'all' && (
              <button
                onClick={() => setSelectedDesignation('all')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Parks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading parks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Error: {error}
            </p>
          </div>
        ) : filteredParks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {search ? 'No parks found.' : 'No parks available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParks.map((park) => (
              <Link
                key={park.id}
                href={`/parks/${park.park_code}`}
                className={'group ' + CARD_STYLES.base + ' ' + CARD_STYLES.hover + ' p-6'}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {park.name}
                    </h3>
                    {park.designation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {park.designation}
                      </p>
                    )}
                  </div>
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 mt-20 py-8">
        <div className={CONTAINER_STYLES.centered + ' text-center text-sm text-gray-600 dark:text-gray-400'}>
          <p>
            Data sourced from{' '}
            <a
              href="https://developer.nps.gov/api/v1/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              NPS Developer API
            </a>{' '}
            • Updated daily at 9 AM UTC
          </p>
        </div>
      </footer>
    </div>
  )
}
