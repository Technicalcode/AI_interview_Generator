import React, { useState } from 'react'
import { Briefcase, FileText, Loader2, Sparkles, Upload } from 'lucide-react'
import { api, readApiError } from '../utils/api'

const interviewTypes = [
  { value: 'mixed', label: 'Mixed', desc: 'Balanced HR and technical practice' },
  { value: 'technical', label: 'Technical', desc: 'Role-specific technical depth' },
  { value: 'hr', label: 'HR', desc: 'Behavioral and communication focus' },
  { value: 'resume', label: 'Resume', desc: 'Questions from your projects and skills' },
]

const difficulties = ['easy', 'medium', 'hard']

function Step1SetUp({ onStart }) {
  const [form, setForm] = useState({
    role: 'Frontend Developer',
    experience: 'Entry level',
    type: 'mixed',
    difficulty: 'medium',
    maxQuestions: 5,
  })
  const [resume, setResume] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const [loadingResume, setLoadingResume] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setResume(file)
    setError('')
    setLoadingResume(true)

    try {
      const data = new FormData()
      data.append('resume', file)
      const result = await api.post('/api/interview/analyze-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResumeData(result.data)
      setForm((current) => ({
        ...current,
        role: result.data.role || current.role,
        experience: result.data.experience || current.experience,
        type: 'resume',
      }))
    } catch (uploadError) {
      setError(readApiError(uploadError, 'Resume analysis failed. You can still start without resume analysis.'))
    } finally {
      setLoadingResume(false)
    }
  }

  const handleStart = async () => {
    setError('')

    if (!form.role.trim() || !form.experience.trim()) {
      setError('Please add role and experience before starting.')
      return
    }

    setStarting(true)
    try {
      const result = await api.post('/api/interview/start', {
        ...form,
        maxQuestions: Number(form.maxQuestions),
        resume: resumeData || {},
      })
      onStart(result.data.interview, result.data.credits)
    } catch (startError) {
      setError(readApiError(startError, 'Unable to start interview right now.'))
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm'>
              <Sparkles size={16} /> Smart mock interview
            </p>
            <h1 className='text-3xl font-bold text-gray-950 md:text-5xl'>Set up your interview</h1>
            <p className='mt-3 max-w-2xl text-gray-600'>Choose the target role, interview style, and optional resume context. One credit is used when the interview starts.</p>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
          <section className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='grid gap-5 md:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-gray-800'>Target role</span>
                <input
                  value={form.role}
                  onChange={(event) => update('role', event.target.value)}
                  className='w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white'
                  placeholder='e.g. MERN Stack Developer'
                />
              </label>

              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-gray-800'>Experience level</span>
                <select
                  value={form.experience}
                  onChange={(event) => update('experience', event.target.value)}
                  className='w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white'
                >
                  <option>Entry level</option>
                  <option>1-2 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </label>
            </div>

            <div className='mt-6'>
              <span className='mb-3 block text-sm font-semibold text-gray-800'>Interview mode</span>
              <div className='grid gap-3 md:grid-cols-2'>
                {interviewTypes.map((type) => (
                  <button
                    key={type.value}
                    type='button'
                    onClick={() => update('type', type.value)}
                    className={`rounded-2xl border p-4 text-left transition ${form.type === type.value ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                  >
                    <span className='block font-semibold'>{type.label}</span>
                    <span className='mt-1 block text-sm text-gray-500'>{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className='mt-6 grid gap-5 md:grid-cols-2'>
              <label>
                <span className='mb-2 block text-sm font-semibold text-gray-800'>Difficulty</span>
                <div className='flex rounded-xl border border-gray-200 bg-gray-50 p-1'>
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      type='button'
                      onClick={() => update('difficulty', difficulty)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${form.difficulty === difficulty ? 'bg-black text-white' : 'text-gray-600 hover:bg-white'}`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                <span className='mb-2 block text-sm font-semibold text-gray-800'>Questions</span>
                <input
                  type='number'
                  min='3'
                  max='10'
                  value={form.maxQuestions}
                  onChange={(event) => update('maxQuestions', event.target.value)}
                  className='w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white'
                />
              </label>
            </div>
          </section>

          <aside className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-5 flex items-center gap-3'>
              <div className='rounded-xl bg-green-50 p-3 text-green-700'>
                <FileText size={22} />
              </div>
              <div>
                <h2 className='font-bold text-gray-950'>Resume context</h2>
                <p className='text-sm text-gray-500'>Optional PDF upload for project-based questions.</p>
              </div>
            </div>

            <label className='flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:bg-white'>
              {loadingResume ? <Loader2 className='mb-3 animate-spin text-green-600' /> : <Upload className='mb-3 text-gray-500' />}
              <span className='font-semibold text-gray-800'>{resume?.name || 'Upload resume PDF'}</span>
              <span className='mt-1 text-sm text-gray-500'>Max 5 MB</span>
              <input type='file' accept='application/pdf' onChange={handleResumeUpload} className='hidden' />
            </label>

            {resumeData && (
              <div className='mt-5 rounded-2xl bg-gray-50 p-4'>
                <p className='mb-3 text-sm font-semibold text-gray-800'>Extracted highlights</p>
                <div className='flex flex-wrap gap-2'>
                  {(resumeData.skills || []).slice(0, 8).map((skill) => (
                    <span key={skill} className='rounded-full bg-white px-3 py-1 text-sm text-gray-700'>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              type='button'
              onClick={handleStart}
              disabled={starting || loadingResume}
              className='mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {starting ? <Loader2 size={18} className='animate-spin' /> : <Briefcase size={18} />}
              Start interview
            </button>

            {error && <p className='mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600'>{error}</p>}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Step1SetUp
