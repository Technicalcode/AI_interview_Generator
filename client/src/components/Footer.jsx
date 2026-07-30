import React from 'react'
import { BsGithub, BsInstagram, BsLinkedin, BsRobot, BsTwitterX } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const footerLinks = {
  Product: [
    { label: 'Start Interview', href: '/interview' },
    { label: 'View History', href: '/history' },
    { label: 'Resume Upload', href: '/resume' },
    { label: 'PDF Reports', href: '/reports' },
    { label: 'Buy Credits', href: '/pricing' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

const socials = [
  { icon: <BsTwitterX size={16} />, href: '#', label: 'Twitter' },
  { icon: <BsGithub size={16} />, href: '#', label: 'GitHub' },
  { icon: <BsLinkedin size={16} />, href: '#', label: 'LinkedIn' },
  { icon: <BsInstagram size={16} />, href: '#', label: 'Instagram' },
]

function Footer() {
  return (
    <footer className='relative overflow-hidden bg-[#0f0f0f] text-white'>
      <div
        className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className='pointer-events-none absolute left-1/2 top-0 h-[200px] w-[600px] -translate-x-1/2 rounded-full bg-green-500 opacity-10 blur-[120px]' />

      <div className='relative mx-auto max-w-6xl px-6 pb-10 pt-20'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-20 rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/20 to-green-900/10 p-10 text-center'
        >
          <div className='mb-4 flex justify-center'>
            <span className='flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs text-green-400'>
              <HiSparkles size={13} /> Free to get started
            </span>
          </div>
          <h2 className='mb-3 text-3xl font-semibold tracking-tight md:text-4xl'>
            Ready to ace your next interview?
          </h2>
          <p className='mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-400'>
            Practice with AI-powered questions, instant feedback, scoring, and saved reports.
          </p>
          <Link
            to='/interview'
            className='inline-block rounded-full bg-green-500 px-10 py-3 font-semibold text-black shadow-lg shadow-green-500/20 transition-all duration-200 hover:bg-green-400'
          >
            Start Free Interview →
          </Link>
        </motion.div>

        <div className='mb-16 grid grid-cols-2 gap-10 md:grid-cols-4'>
          <div className='col-span-2 md:col-span-1'>
            <Link to='/' className='group mb-4 flex w-fit items-center gap-2'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 transition group-hover:bg-green-500/20'>
                <BsRobot size={18} />
              </div>
              <span className='text-lg font-semibold tracking-tight'>InterviewIQ.AI</span>
            </Link>
            <p className='mb-6 max-w-[220px] text-sm leading-relaxed text-gray-500'>
              AI-powered mock interviews with smart follow-ups, real-time evaluation, and report history.
            </p>

            <div className='flex gap-3'>
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-500 transition-all duration-200 hover:border-green-500/40 hover:text-green-400'
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className='mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400'>
                {section}
              </h4>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className='text-sm text-gray-500 transition-colors duration-200 hover:text-green-400'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row'>
          <p className='text-xs text-gray-600'>
            © {new Date().getFullYear()} InterviewIQ.AI. All rights reserved.
          </p>
          <div className='flex items-center gap-2 text-xs text-gray-600'>
            <span>Built with</span>
            <HiSparkles size={12} className='text-green-500' />
            <span>AI Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
