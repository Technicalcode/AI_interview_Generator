import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Download, FileText, Loader2, Printer, Search, Trophy } from 'lucide-react'
import { api, readApiError } from '../utils/api'

function InterviewReport() {
  const { interviewId } = useParams()
  const [interviews, setInterviews] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (interviewId) {
          const result = await api.get(`/api/interview/${interviewId}`)
          if (mounted) setSelected(result.data)
        } else {
          const result = await api.get('/api/interview/history')
          if (mounted) {
            setSelected(null)
            setInterviews(result.data)
          }
        }
      } catch (loadError) {
        if (mounted) setError(readApiError(loadError, 'Unable to load reports.'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [interviewId])

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim()
    if (!needle) return interviews
    return interviews.filter((item) => [
      item.role,
      item.experience,
      item.type,
      item.status
    ].join(' ').toLowerCase().includes(needle))
  }, [interviews, query])

  const stats = useMemo(() => {
    const completed = interviews.filter((item) => item.status === 'completed')
    const average = completed.length
      ? Math.round(completed.reduce((sum, item) => sum + Number(item.report?.overallScore || 0), 0) / completed.length)
      : 0

    return {
      total: interviews.length,
      completed: completed.length,
      average,
    }
  }, [interviews])

  const detail = selected

  const downloadReport = async () => {
    if (!detail?._id) return

    try {
      const result = await api.get(`/api/interview/${detail._id}/export`)
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${detail.role.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-report.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(readApiError(downloadError, 'Unable to download report.'))
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#f5f6f4]'>
        <Loader2 className='animate-spin text-green-600' />
      </div>
    )
  }

  if (detail) {
    const report = detail.report || {}
    return (
      <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden'>
            <Link to='/history' className='inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black'>
              <ArrowLeft size={16} /> Back to history
            </Link>
            <div className='flex flex-wrap gap-2'>
              <button onClick={() => window.print()} className='inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700'>
                <Printer size={16} /> Save as PDF
              </button>
              <button onClick={downloadReport} className='inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white'>
                <Download size={16} /> Download data
              </button>
            </div>
          </div>

          <div className='rounded-2xl bg-black p-8 text-white'>
            <p className='text-sm font-semibold text-green-300'>{detail.type} interview</p>
            <h1 className='mt-2 text-4xl font-bold'>{detail.role}</h1>
            <p className='mt-3 text-gray-300'>{report.summary || 'Report is not available yet.'}</p>
          </div>

          <div className='mt-6 grid gap-6 lg:grid-cols-3'>
            <div className='rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm'>
              <Trophy className='mx-auto mb-3 text-green-600' />
              <p className='text-5xl font-bold text-gray-950'>{report.overallScore || 0}</p>
              <p className='text-sm text-gray-500'>Overall score</p>
            </div>
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2'>
              <h2 className='mb-4 font-bold text-gray-950'>Recommended topics</h2>
              <div className='flex flex-wrap gap-2'>
                {(report.recommendedTopics || []).map((topic) => (
                  <span key={topic} className='rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700'>{topic}</span>
                ))}
              </div>
            </div>
          </div>

          <section className='mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-5 text-xl font-bold text-gray-950'>Answers</h2>
            <div className='space-y-4'>
              {(detail.answers || []).map((answer, index) => (
                <article key={`${answer.question}-${index}`} className='rounded-2xl bg-gray-50 p-5'>
                  <div className='mb-2 flex flex-col gap-2 sm:flex-row sm:justify-between'>
                    <h3 className='font-semibold text-gray-950'>Q{index + 1}. {answer.question}</h3>
                    <span className='rounded-full bg-white px-3 py-1 text-sm font-semibold'>{answer.score}/100</span>
                  </div>
                  <p className='text-sm text-gray-600'>{answer.answer}</p>
                  <p className='mt-3 text-sm font-medium text-green-700'>{answer.feedback}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm'>
              <FileText size={16} /> Saved reports
            </p>
            <h1 className='text-4xl font-bold text-gray-950'>Interview history</h1>
            <p className='mt-2 text-gray-600'>Review scores, feedback, and progress from previous sessions.</p>
          </div>
          <label className='relative w-full md:w-80'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search history'
              className='w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-green-500'
            />
          </label>
        </div>

        {error && <p className='mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>{error}</p>}

        <div className='mb-6 grid gap-4 md:grid-cols-3'>
          {[
            ['Total sessions', stats.total],
            ['Completed', stats.completed],
            ['Average score', `${stats.average}/100`],
          ].map(([label, value]) => (
            <div key={label} className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
              <p className='text-sm font-medium text-gray-500'>{label}</p>
              <p className='mt-2 text-3xl font-bold text-gray-950'>{value}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className='rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm'>
            <p className='text-lg font-semibold text-gray-950'>No interviews yet</p>
            <p className='mt-2 text-gray-500'>Start an interview to generate your first report.</p>
            <Link to='/interview' className='mt-5 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white'>Start interview</Link>
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filtered.map((item) => (
              <Link key={item._id} to={`/reports/${item._id}`} className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
                <div className='mb-4 flex items-start justify-between gap-3'>
                  <div>
                    <h2 className='font-bold text-gray-950'>{item.role}</h2>
                    <p className='text-sm capitalize text-gray-500'>{item.type} / {item.status.replace('_', ' ')}</p>
                  </div>
                  <span className='rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700'>{item.report?.overallScore || 0}</span>
                </div>
                <p className='line-clamp-2 text-sm text-gray-600'>{item.report?.summary || `${item.answers?.length || 0} answers submitted.`}</p>
                <div className='mt-5 flex items-center gap-2 text-xs font-medium text-gray-500'>
                  <Calendar size={14} />
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewReport
