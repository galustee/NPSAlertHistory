'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, MapPin, AlertTriangle, TrendingUp } from 'lucide-react'

interface Park {
  id: string
  park_code: string
  name: string
  created_at: string
}

export default function Home() {
  const [parks, setParks] = useState<Park[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParks()
  }, [])

  const fetchParks = async () => {
    try {
      const res = await fetch('/api/parks')
      const data = await res.json()
      setParks(data)
    } catch (err) {
      console.error('Failed to fetch parks:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredParks = parks.filter(
    (park) =>
      park.name.toLowerCase().includes(search.toLowerCase()) ||
      park.park_code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Track Alert History Across National Parks
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            The National Park Service provides current alerts, but we preserve the full timeline.
            See what alerts have affected each park over time.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Parks Tracked
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {parks.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Real-time Polling
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              Every 15 min
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Data Source
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              NPS API
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search parks by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Parks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading parks...</p>
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
                className="group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {park.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {park.park_code}
                    </p>
                  </div>
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Tracked since{' '}
                  {new Date(park.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600 dark:text-gray-400">
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
