import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'
import { setUserData } from '../Redux/userSlice'

function InterviewPage() {
  const [step, setStep] = useState(1)
  const [interviewData, setInterviewData] = useState(null)
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const handleStart = (interview, credits) => {
    setInterviewData(interview)
    if (userData && typeof credits === 'number') {
      dispatch(setUserData({ ...userData, credits }))
    }
    setStep(2)
  }

  const handleFinish = (interview) => {
    setInterviewData(interview)
    setStep(3)
  }

  const restart = () => {
    setInterviewData(null)
    setStep(1)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {step === 1 && <Step1SetUp onStart={handleStart} />}
      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onUpdate={setInterviewData}
          onFinish={handleFinish}
        />
      )}
      {step === 3 && <Step3Report report={interviewData} onRestart={restart} />}
    </div>
  )
}

export default InterviewPage
