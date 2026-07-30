import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeIndianRupee, CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { api, readApiError } from '../utils/api'
import { setUserData } from '../Redux/userSlice'

const plans = [
  { id: 'demo', name: 'Demo', credits: 100, price: 'Free', desc: 'Starter credits added when your account is created.', disabled: true },
  { id: 'practice', name: 'Practice', credits: 50, price: '₹49', desc: 'For regular mock interview practice.' },
  { id: 'pro', name: 'Pro', credits: 200, price: '₹149', desc: 'For heavy interview preparation.' },
]

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true)
    return
  }

  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => resolve(true)
  script.onerror = () => resolve(false)
  document.body.appendChild(script)
})

function Pricing() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [loadingPlan, setLoadingPlan] = useState('')
  const [payments, setPayments] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadHistory = async () => {
      try {
        const result = await api.get('/api/payment/history')
        if (mounted) setPayments(result.data)
      } catch {
        if (mounted) setPayments([])
      }
    }

    if (userData) loadHistory()
    return () => {
      mounted = false
    }
  }, [userData])

  const buyCredits = async (planId) => {
    setError('')
    setMessage('')

    if (!userData) {
      setError('Please sign in before buying credits.')
      return
    }

    setLoadingPlan(planId)
    try {
      const scriptLoaded = await loadRazorpay()
      if (!scriptLoaded) {
        throw new Error('Razorpay checkout could not load. Check your internet connection.')
      }

      const order = await api.post('/api/payment/create-order', { plan: planId })

      const options = {
        key: order.data.keyId,
        amount: order.data.amount,
        currency: order.data.currency,
        name: 'InterviewIQ.AI',
        description: `${order.data.credits} practice credits`,
        order_id: order.data.orderId,
        prefill: {
          name: order.data.user?.name || userData.name,
          email: order.data.user?.email || userData.email,
        },
        theme: {
          color: '#16a34a',
        },
        handler: async (response) => {
          try {
            const verified = await api.post('/api/payment/verify', response)
            dispatch(setUserData(verified.data.user))
            setPayments((current) => [verified.data.payment, ...current.filter((item) => item.orderId !== verified.data.payment.orderId)])
            setMessage(`${verified.data.payment.credits} credits added successfully.`)
          } catch (verifyError) {
            setError(readApiError(verifyError, 'Payment verification failed.'))
          }
        },
      }

      const checkout = new window.Razorpay(options)
      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.')
      })
      checkout.open()
    } catch (buyError) {
      setError(readApiError(buyError, 'Unable to start payment.'))
    } finally {
      setLoadingPlan('')
    }
  }

  return (
    <div className='min-h-screen bg-[#f5f6f4] px-5 py-8'>
      <div className='mx-auto max-w-5xl'>
        <div className='rounded-2xl bg-black p-8 text-white'>
          <p className='mb-2 text-sm font-semibold text-green-300'>Credits</p>
          <h1 className='text-4xl font-bold'>Practice credits</h1>
          <p className='mt-3 max-w-2xl text-gray-300'>Each interview uses one credit. Payments are verified on the backend before credits are added.</p>
          <div className='mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold'>
            <ShieldCheck size={16} /> Current credits: {userData?.credits ?? 0}
          </div>
        </div>

        {message && <p className='mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700'>{message}</p>}
        {error && <p className='mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600'>{error}</p>}

        <div className='mt-6 grid gap-5 md:grid-cols-3'>
          {plans.map((plan) => (
            <article key={plan.name} className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700'>
                {plan.disabled ? <CheckCircle2 /> : <BadgeIndianRupee />}
              </div>
              <h2 className='text-xl font-bold text-gray-950'>{plan.name}</h2>
              <p className='mt-2 text-sm text-gray-500'>{plan.desc}</p>
              <p className='mt-5 text-3xl font-bold text-gray-950'>{plan.price}</p>
              <p className='mt-1 text-sm font-medium text-gray-600'>{plan.credits} credits</p>
              <button
                disabled={plan.disabled || Boolean(loadingPlan)}
                onClick={() => buyCredits(plan.id)}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${plan.disabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800 disabled:opacity-60'}`}
              >
                {loadingPlan === plan.id ? <Loader2 size={18} className='animate-spin' /> : <CreditCard size={18} />}
                {plan.disabled ? 'Included' : 'Buy credits'}
              </button>
            </article>
          ))}
        </div>

        <section className='mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='font-bold text-gray-950'>Payment history</h2>
          {payments.length === 0 ? (
            <p className='mt-2 text-sm text-gray-500'>No credit purchases yet.</p>
          ) : (
            <div className='mt-4 divide-y divide-gray-100'>
              {payments.map((payment) => (
                <div key={payment._id || payment.orderId} className='flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='font-semibold capitalize text-gray-900'>{payment.plan} plan</p>
                    <p className='text-sm text-gray-500'>{payment.credits} credits · ₹{Math.round(payment.amount / 100)}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${payment.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link to='/interview' className='mt-6 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white'>Back to interview</Link>
      </div>
    </div>
  )
}

export default Pricing
