import React, { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import InterviewPage from './pages/InterviewPage'
import InterviewReport from './pages/InterviewReport'
import Pricing from './pages/Pricing'
import InfoPage from './pages/InfoPage'

import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from './Redux/userSlice'
import { api } from './utils/api'

function App() {
  const { userData } = useSelector((state) => state.user)
  const [authChecked, setAuthChecked] = React.useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    let isMounted = true

    const getUser = async () => {
      try {
        const result = await api.get("/api/user/current-user")
        if (isMounted) {
          dispatch(setUserData(result.data))
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Failed to load current user:", error.message)
        }

        if (isMounted) {
          dispatch(setUserData(null))
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true)
        }
      }
    }

    getUser()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  useEffect(() => {
    const protectedPaths = ['/interview', '/history', '/reports', '/pricing']
    const isProtectedPath = protectedPaths.some((path) => location.pathname.startsWith(path))

    if (authChecked && !userData && isProtectedPath) {
      navigate('/auth')
    }
  }, [authChecked, location.pathname, navigate, userData])

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/reports' element={<InterviewReport />} />
      <Route path='/history' element={<InterviewReport />} />
      <Route path='/reports/:interviewId' element={<InterviewReport />} />
      <Route path='/pricing' element={<Pricing />} />
      <Route path='/:page' element={<InfoPage />} />
    </Routes>
  )
}

export default App
