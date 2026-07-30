import React, { useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Send, StopCircle } from 'lucide-react'
import { api, readApiError } from '../utils/api'

function Step2Interview({ interviewData, onFinish, onUpdate }) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState('')

  const progress = useMemo(() => {
    const done = interviewData?.answers?.length || 0
    const total = interviewData?.maxQuestions || 5
    return { done, total, percent: Math.round((done / total) * 100) }
  }, [interviewData])

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please write an answer before submitting.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await api.post(`/api/interview/${interviewData._id}/answer`, { answer })
      setAnswer('')
      if (result.data.complete) {
        onFinish(result.data.interview)
      } else {
        onUpdate(result.data.interview)
      }
    } catch (submitError) {
      setError(readApiError(submitError, 'Unable to submit answer.'))
    } finally {
      setLoading(false)
    }
  }

  const endInterview = async () => {
    setEnding(true)
    setError('')
    try {
      const result = await api.post(`/api/interview/${interviewData._id}/complete`)
      onFinish(result.data.interview)
    } catch (endError) {
      setError(readApiError(endError, 'Unable to complete interview.'))
    } finally {
      setEnding(false)
    }
  }

  const latestFeedback = interviewData?.answers?.at?.(-1)

  return (
    <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
      <div className='mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]'>
        <aside className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-green-700'>Live interview</p>
          <h1 className='mt-2 text-3xl font-bold text-gray-950'>{interviewData?.role}</h1>
          <p className='mt-2 text-gray-500'>{interviewData?.experience} / {interviewData?.type} / {interviewData?.difficulty}</p>

          <div className='mt-6'>
            <div className='mb-2 flex justify-between text-sm font-medium text-gray-600'>
              <span>Progress</span>
              <span>{progress.done}/{progress.total}</span>
            </div>
            <div className='h-3 overflow-hidden rounded-full bg-gray-100'>
              <div className='h-full rounded-full bg-green-500 transition-all' style={{ width: `${progress.percent}%` }} />
            </div>
          </div>

          {latestFeedback && (
            <div className='mt-6 rounded-2xl bg-gray-50 p-4'>
              <div className='mb-2 flex items-center gap-2 font-semibold text-gray-900'>
                <CheckCircle2 size={18} className='text-green-600' />
                Last feedback
              </div>
              <p className='text-sm text-gray-600'>{latestFeedback.feedback}</p>
              <p className='mt-3 text-sm font-semibold text-gray-900'>Score: {latestFeedback.score}/100</p>
            </div>
          )}

          <button
            type='button'
            onClick={endInterview}
            disabled={ending || loading}
            className='mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60'
          >
            {ending ? <Loader2 size={18} className='animate-spin' /> : <StopCircle size={18} />}
            End and generate report
          </button>
        </aside>

        <main className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='rounded-2xl bg-black p-6 text-white'>
            <p className='mb-3 text-sm font-semibold text-green-300'>Question {progress.done + 1}</p>
            <h2 className='text-2xl font-semibold leading-snug'>{interviewData?.currentQuestion || 'Preparing your next question...'}</h2>
          </div>

          <label className='mt-6 block'>
            <span className='mb-2 block text-sm font-semibold text-gray-800'>Your answer</span>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={9}
              className='w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none transition focus:border-green-500 focus:bg-white'
              placeholder='Write your answer with context, action, result, and any measurable impact...'
            />
          </label>

          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-gray-500'>{answer.trim().split(/\s+/).filter(Boolean).length} words</p>
            <button
              type='button'
              onClick={submitAnswer}
              disabled={loading || ending}
              className='flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? <Loader2 size={18} className='animate-spin' /> : <Send size={18} />}
              Submit answer
            </button>
          </div>

          {error && <p className='mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>{error}</p>}
        </main>
      </div>
    </div>
  )
}

export default Step2Interview
