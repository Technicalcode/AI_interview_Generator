import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, FileText, Mail, Newspaper, ShieldCheck, Users } from 'lucide-react'

const pages = {
  about: {
    title: 'About InterviewIQ.AI',
    icon: Users,
    intro: 'InterviewIQ.AI helps candidates practice role-based mock interviews with AI-generated questions, instant feedback, scoring, and progress history.',
    sections: [
      ['What we do', 'We create HR, technical, resume-based, and mixed interview sessions tailored to the candidate role and experience level.'],
      ['Who it is for', 'Students, freshers, job seekers, and developers preparing for interviews can use it to improve answer quality and confidence.'],
      ['Core value', 'The platform turns interview preparation into a repeatable practice loop: answer, receive feedback, improve, and track progress.'],
    ],
  },
  blog: {
    title: 'Interview Preparation Blog',
    icon: Newspaper,
    intro: 'Practical interview preparation notes and learning guides will live here.',
    sections: [
      ['Technical answers', 'Start with the concept, explain a real example, mention trade-offs, and finish with measurable impact.'],
      ['HR answers', 'Use a clear structure: situation, action, result, and what you learned.'],
      ['Resume interviews', 'Prepare short explanations for every project, including your role, stack, challenge, and outcome.'],
    ],
  },
  careers: {
    title: 'Careers',
    icon: Briefcase,
    intro: 'InterviewIQ.AI is currently a project-stage product. Career openings are not active yet.',
    sections: [
      ['Current status', 'No open roles are available right now.'],
      ['Future roles', 'Potential future roles may include frontend developer, backend developer, AI prompt engineer, and product designer.'],
      ['How to contribute', 'For now, improve the product by testing interview flows, checking reports, and suggesting useful features.'],
    ],
  },
  contact: {
    title: 'Contact',
    icon: Mail,
    intro: 'Use this page as the contact point for project feedback, bug reports, and feature suggestions.',
    sections: [
      ['Support', 'For login, interview, report, or payment issues, include the page name and the exact error message.'],
      ['Feedback', 'Share which interview mode you used, what question felt wrong, and what improvement you expected.'],
      ['Project inquiries', 'For demo or academic review, prepare the project goal, workflow, and technology stack summary.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    intro: 'This project stores only the data needed to provide interview practice, reports, history, and credits.',
    sections: [
      ['Data collected', 'Name, email, credits, interview setup, answers, AI feedback, reports, and optional resume text may be stored.'],
      ['How data is used', 'Data is used to authenticate users, generate interviews, evaluate answers, save reports, and show history.'],
      ['Sensitive files', 'Uploaded resumes are processed for text extraction and should be handled carefully before production launch.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    intro: 'InterviewIQ.AI is an interview practice tool. It does not guarantee job selection or hiring outcomes.',
    sections: [
      ['Use of service', 'Users should use the platform for learning, practice, and self-improvement.'],
      ['AI feedback', 'AI-generated questions and scores are guidance only and may not always be perfect.'],
      ['Payments and credits', 'Credits should be added only after verified payment when payment mode is enabled.'],
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    icon: ShieldCheck,
    intro: 'The app uses cookies mainly for authentication.',
    sections: [
      ['Authentication cookie', 'A secure HTTP-only cookie stores the login token so the backend can identify the user.'],
      ['Local development', 'During local testing, cookies are configured for localhost-compatible behavior.'],
      ['Production', 'In production, cookies should be used only over HTTPS with production-safe settings.'],
    ],
  },
  resume: {
    title: 'Resume Upload',
    icon: FileText,
    intro: 'Resume upload is available inside the interview setup flow.',
    sections: [
      ['How it works', 'Go to Start Interview, upload a PDF resume, and the app will extract role, skills, projects, and experience.'],
      ['Supported format', 'Only PDF files up to 5 MB are accepted.'],
      ['Best results', 'Use a clean resume with readable project descriptions and skill sections.'],
    ],
  },
}

function InfoPage() {
  const { page = 'about' } = useParams()
  const content = pages[page] || pages.about
  const Icon = content.icon

  return (
    <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
      <div className='mx-auto max-w-5xl'>
        <Link to='/' className='mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black'>
          <ArrowLeft size={16} /> Back home
        </Link>

        <section className='rounded-2xl bg-black p-8 text-white'>
          <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-300'>
            <Icon size={24} />
          </div>
          <h1 className='text-4xl font-bold md:text-5xl'>{content.title}</h1>
          <p className='mt-4 max-w-3xl text-gray-300'>{content.intro}</p>
        </section>

        <div className='mt-6 grid gap-5 md:grid-cols-3'>
          {content.sections.map(([title, body]) => (
            <article key={title} className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
              <h2 className='font-bold text-gray-950'>{title}</h2>
              <p className='mt-3 text-sm leading-6 text-gray-600'>{body}</p>
            </article>
          ))}
        </div>

        <div className='mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-600'>
            This page is part of the InterviewIQ.AI project documentation and can be expanded with final company, legal, or support details before production deployment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InfoPage
