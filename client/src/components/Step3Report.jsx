import React from 'react'
import { Link } from 'react-router-dom'
import { Award, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react'

function Step3Report({ report, onRestart }) {
  const finalReport = report?.report || {}
  const answers = report?.answers || []

  return (
    <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='rounded-2xl bg-black p-8 text-white'>
          <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='mb-2 text-sm font-semibold text-green-300'>Interview completed</p>
              <h1 className='text-3xl font-bold md:text-5xl'>{report?.role}</h1>
              <p className='mt-3 text-gray-300'>{finalReport.summary}</p>
            </div>
            <div className='rounded-2xl bg-white/10 p-6 text-center'>
              <Award className='mx-auto mb-2 text-green-300' />
              <p className='text-5xl font-bold'>{finalReport.overallScore || 0}</p>
              <p className='text-sm text-gray-300'>Overall score</p>
            </div>
          </div>
        </div>

        <div className='mt-6 grid gap-6 lg:grid-cols-3'>
          <section className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 flex items-center gap-2 font-bold text-gray-950'><CheckCircle2 size={19} className='text-green-600' /> Strengths</h2>
            <ul className='space-y-3 text-sm text-gray-600'>
              {(finalReport.strengths || []).map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </section>
          <section className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 flex items-center gap-2 font-bold text-gray-950'><TrendingUp size={19} className='text-blue-600' /> Improvements</h2>
            <ul className='space-y-3 text-sm text-gray-600'>
              {(finalReport.improvements || []).map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </section>
          <section className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 font-bold text-gray-950'>Recommended topics</h2>
            <div className='flex flex-wrap gap-2'>
              {(finalReport.recommendedTopics || []).map((item) => <span key={item} className='rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700'>{item}</span>)}
            </div>
          </section>
        </div>

        <section className='mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-5 text-xl font-bold text-gray-950'>Question review</h2>
          <div className='space-y-4'>
            {answers.map((item, index) => (
              <article key={`${item.question}-${index}`} className='rounded-2xl bg-gray-50 p-5'>
                <div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                  <h3 className='font-semibold text-gray-950'>Q{index + 1}. {item.question}</h3>
                  <span className='rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800'>{item.score}/100</span>
                </div>
                <p className='text-sm text-gray-600'>{item.answer}</p>
                <p className='mt-3 text-sm font-medium text-green-700'>{item.feedback}</p>
              </article>
            ))}
          </div>
        </section>

        <div className='mt-6 flex flex-wrap gap-3'>
          <button onClick={onRestart} className='inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white'>
            <RotateCcw size={18} /> New interview
          </button>
          <Link to='/history' className='rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800'>View history</Link>
        </div>
      </div>
    </div>
  )
}

export default Step3Report
