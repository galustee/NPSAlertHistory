'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  Calendar,
  FileText,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  History,
} from 'lucide-react'
import BackButton from '@/app/components/BackButton'

interface Alert {
  id: string
  nps_alert_id: string
  title: string
  description: string
  category: string
  url: string
  last_updated_by_nps: string
  fetched_at: string
}

interface HistoryVersion {
  id: string
  title: string
  description: string
  category: string
  url: string
  last_updated_by_nps: string
  fetched_at: string
}

interface ParkData {
  park: {
    id: string
    park_code: string
    name: string
    designation?: string
  }
  currentAlerts: Alert[]
  inactiveAlerts: Alert[]
}

export default function ParkPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const code = params.code as string
  const alertIdFromUrl = searchParams.get('alertId')

  const [parkData, setParkData] = useState<ParkData | null>(null)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [history, setHistory] = useState<Record<string, HistoryVersion[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParkData = useCallback(async () => {
    try {
      const res = await fetch(`/api/parks/${code}/alerts`)
      if (!res.ok) throw new Error('Park not found')
      const data: ParkData = await res.json()
      setParkData(data)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (code) {
      fetchParkData()
    }
  }, [code, fetchParkData])

  // Auto-expand and scroll to alert if alertId is in URL
  useEffect(() => {
    if (alertIdFromUrl && parkData) {
      setExpandedAlert(alertIdFromUrl)
      
      // Scroll to the alert after a small delay to ensure DOM is updated
      setTimeout(() => {
        const alertElement = document.querySelector(`[data-alert-id="${alertIdFromUrl}"]`)
        if (alertElement) {
          // Scroll with padding above the alert box
          const yOffset = -100 // pixels to offset from top
          const y = alertElement.getBoundingClientRect().top + window.scrollY + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    }
  }, [alertIdFromUrl, parkData])

  const fetchAlertHistory = async (alertId: string) => {
    try {
      const res = await fetch(`/api/parks/${code}/history?alertId=${alertId}`)
      if (!res.ok) throw new Error('Failed to load history')
      const data = await res.json()
      setHistory((prev) => ({
        ...prev,
        [alertId]: data.history || [],
      }))
    } catch (err) {
      console.error('Error fetching history:', err)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'danger':
      case 'closure':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
      case 'caution':
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
      case 'info':
      case 'information':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading park data...</p>
      </div>
    )
  }

  if (error || !parkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <BackButton />
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {error ? `Error: ${error}` : 'Park not found'}
          </p>
        </div>
      </div>
    )
  }

  const { park, currentAlerts, inactiveAlerts = [] } = parkData

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Back Button Navigation */}
      <BackButton />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          {park.designation && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
              {park.designation}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {park.name}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {currentAlerts.length} active{' '}
              {currentAlerts.length === 1 ? 'alert' : 'alerts'}
            </p>
            <a
              href={`https://www.nps.gov/${code}/planyourvisit/conditions.htm`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View current alerts on NPS.gov
            </a>
          </div>
        </div>

        {/* Alerts Grid */}
        {currentAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No active alerts for this park
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentAlerts.map((alert) => (
              <div
                key={alert.nps_alert_id}
                data-alert-id={alert.nps_alert_id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Alert Summary */}
                <button
                  onClick={() => {
                    const newExpanded =
                      expandedAlert === alert.nps_alert_id
                        ? null
                        : alert.nps_alert_id
                    setExpandedAlert(newExpanded)
                    if (newExpanded && !history[alert.nps_alert_id]) {
                      fetchAlertHistory(alert.nps_alert_id)
                    }
                  }}
                  className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                          alert.category
                        )}`}
                      >
                        {alert.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Updated{' '}
                      {new Date(alert.last_updated_by_nps).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedAlert === alert.nps_alert_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedAlert === alert.nps_alert_id && (
                  <div className="border-t border-gray-200 dark:border-slate-700 p-6 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {alert.description}
                      </p>
                    </div>

                    {alert.url && (
                      <div className="pt-3">
                        <a
                          href={alert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          More information on NPS.gov
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
                          Last Updated (NPS)
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(
                            alert.last_updated_by_nps
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
                          First Fetched
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.fetched_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Alert History Timeline */}
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                      <button
                        onClick={() => {
                          if (!history[alert.nps_alert_id]) {
                            fetchAlertHistory(alert.nps_alert_id)
                          }
                          setExpandedHistory(
                            expandedHistory === alert.nps_alert_id
                              ? null
                              : alert.nps_alert_id
                          )
                        }}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <History className="w-4 h-4" />
                        {history[alert.nps_alert_id]
                          ? `Alert History (${history[alert.nps_alert_id].length} versions)`
                          : 'View Alert History'}
                        {expandedHistory === alert.nps_alert_id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedHistory === alert.nps_alert_id && history[alert.nps_alert_id] && (
                        <div className="mt-4 space-y-3">
                          {history[alert.nps_alert_id].length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No history available for this alert.
                            </p>
                          ) : (
                            history[alert.nps_alert_id].map(
                              (version, index) => (
                                <div
                                  key={`${version.fetched_at}-${index}`}
                                  className="relative pl-6"
                                >
                                  {/* Timeline connector */}
                                  {index <
                                    history[alert.nps_alert_id].length - 1 && (
                                    <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-600"></div>
                                  )}

                                  {/* Timeline dot */}
                                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>

                                  <div className="bg-white dark:bg-slate-700/50 rounded p-4 border border-gray-100 dark:border-slate-600">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                          {new Date(
                                            version.last_updated_by_nps
                                          ).toLocaleString()}
                                        </p>
                                        {index === 0 && (
                                          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                            (Current)
                                          </span>
                                        )}
                                      </div>
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(
                                          version.category
                                        )}`}
                                      >
                                        {version.category}
                                      </span>
                                    </div>
                                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                      {version.title}
                                    </h5>
                                    <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {version.description}
                                    </div>
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Inactive Alerts Section */}
        {inactiveAlerts && inactiveAlerts.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Inactive Alerts
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {inactiveAlerts.length} alert{inactiveAlerts.length !== 1 ? 's' : ''} no longer active on NPS.gov (archived)
              </p>
            </div>

            <div className="space-y-4">
              {inactiveAlerts.map((alert) => (
                <div
                  key={alert.nps_alert_id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow opacity-70"
                >
                  {/* Alert Summary */}
                  <button
                    onClick={() => {
                      const newExpanded =
                        expandedAlert === alert.nps_alert_id
                          ? null
                          : alert.nps_alert_id
                      setExpandedAlert(newExpanded)
                      if (newExpanded && !history[alert.nps_alert_id]) {
                        fetchAlertHistory(alert.nps_alert_id)
                      }
                    }}
                    className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                            alert.category
                          )}`}
                        >
                          {alert.category}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Last seen{' '}
                        {new Date(alert.fetched_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedAlert === alert.nps_alert_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedAlert === alert.nps_alert_id && (
                    <div className="border-t border-gray-200 dark:border-slate-700 p-6 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Description
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {alert.description}
                        </p>
                      </div>

                      {alert.url && (
                        <div className="pt-3">
                          <a
                            href={alert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            More information on NPS.gov
                          </a>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
                            Last Updated (NPS)
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              alert.last_updated_by_nps
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
                            Last Seen
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(alert.fetched_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Alert History Timeline */}
                      <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                        <button
                          onClick={() => {
                            if (!history[alert.nps_alert_id]) {
                              fetchAlertHistory(alert.nps_alert_id)
                            }
                            setExpandedHistory(
                              expandedHistory === alert.nps_alert_id
                                ? null
                                : alert.nps_alert_id
                            )
                          }}
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <History className="w-4 h-4" />
                          {history[alert.nps_alert_id]
                            ? `Alert History (${history[alert.nps_alert_id].length} versions)`
                            : 'View Alert History'}
                          {expandedHistory === alert.nps_alert_id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedHistory === alert.nps_alert_id && history[alert.nps_alert_id] && (
                          <div className="mt-4 space-y-3">
                            {history[alert.nps_alert_id].length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No history available for this alert.
                              </p>
                            ) : (
                              history[alert.nps_alert_id].map(
                                (version, index) => (
                                  <div
                                    key={`${version.fetched_at}-${index}`}
                                    className="relative pl-6"
                                  >
                                    {/* Timeline connector */}
                                    {index <
                                      history[alert.nps_alert_id].length - 1 && (
                                      <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-600"></div>
                                    )}

                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>

                                    <div className="bg-white dark:bg-slate-700/50 rounded p-4 border border-gray-100 dark:border-slate-600">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                            {new Date(
                                              version.last_updated_by_nps
                                            ).toLocaleString()}
                                          </p>
                                          {index === 0 && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                              (Most Recent)
                                            </span>
                                          )}
                                        </div>
                                        <span
                                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(
                                            version.category
                                          )}`}
                                        >
                                          {version.category}
                                        </span>
                                      </div>
                                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        {version.title}
                                      </h5>
                                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {version.description}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            📊 About This Data
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This page shows the current alerts for {park.name}. We poll the NPS
            API every 15 minutes and store the complete alert history in our
            database. This allows us to track how alerts change over time for
            each park.
          </p>
        </div>
      </div>
    </div>
  )
}
