'use client'

import { useState, useEffect } from 'react'

interface CacheStats {
  totalLessons: number
  totalQuizzes: number
  lessonsByType: Record<string, number>
  lessonsByLanguage: Record<string, number>
  lessonsBySubject: Record<string, number>
  quizzesByType: Record<string, number>
  recentLessons: Array<{
    path: string
    language: string
    type: string
    created: string
    contentLength: number
    usageCount: number
  }>
}

interface CachedLesson {
  id: string
  subject: string
  grade_level: string
  topic: string
  subtopic: string
  target_language: string
  generation_type: string
  quality_score: number
  usage_count: number
  created_at: string
  content_preview: string
}

interface CacheData {
  success: boolean
  message: string
  timestamp: string
  statistics: CacheStats
  rawData: {
    lessons: CachedLesson[]
    quizzes: any[]
  }
}

export default function CacheDebugPage() {
  const [cacheData, setCacheData] = useState<CacheData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCacheData()
  }, [])

  const fetchCacheData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug/cache')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cache data')
      }
      
      setCacheData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cache data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Cache Data</h2>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchCacheData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!cacheData) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">No cache data available</p>
        </div>
      </div>
    )
  }

  const { statistics, rawData } = cacheData

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cache Debug Dashboard</h1>
          <p className="text-gray-600">View cached lessons and quizzes data</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(cacheData.timestamp).toLocaleString()}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Lessons</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.totalLessons}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Quizzes</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.totalQuizzes}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">AI Generated</h3>
            <p className="text-3xl font-bold text-purple-600">{statistics.lessonsByType.ai || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Fallback Content</h3>
            <p className="text-3xl font-bold text-orange-600">{statistics.lessonsByType.fallback || 0}</p>
          </div>
        </div>

        {/* Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Languages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
            <div className="space-y-2">
              {Object.entries(statistics.lessonsByLanguage).map(([lang, count]) => (
                <div key={lang} className="flex justify-between items-center">
                  <span className="text-gray-700">{lang.toUpperCase()}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects</h3>
            <div className="space-y-2">
              {Object.entries(statistics.lessonsBySubject).map(([subject, count]) => (
                <div key={subject} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{subject}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Types */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Types</h3>
            <div className="space-y-2">
              {Object.entries(statistics.lessonsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{type}</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Lessons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lessons</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson Path</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.recentLessons.map((lesson, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.path}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.language.toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        lesson.type === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {lesson.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.usageCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(lesson.created).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Cached Lessons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Cached Lessons ({rawData.lessons.length})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtopic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rawData.lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">{lesson.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.grade_level}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.topic.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.subtopic.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lesson.target_language.toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        lesson.generation_type === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {lesson.generation_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(lesson.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}