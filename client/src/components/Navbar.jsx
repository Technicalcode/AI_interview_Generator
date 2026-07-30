import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion';
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import AuthModel from '../components/AuthModel';
import { Link, useNavigate } from 'react-router-dom';
import { setUserData } from '../Redux/userSlice';
import { api } from '../utils/api';


function Navbar() {

  const { userData } = useSelector((state) => state.user)
  const [showCreditPopup, setShowCreditPopup] = useState(false)
  const [showUserPopup, setShowUserPopup] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout")
      dispatch(setUserData(null))
      setShowCreditPopup(false)
      setShowUserPopup(false)
      navigate("/")

    } catch (error) {
      console.log(error);

    }
  }


  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6 '>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-center items-center
        relative '>
        {/* Parent container ensures everything stays on the left */}
        <div className="w-full flex justify-start p-4">

          {/* The Logo Group */}
          <div className="group flex items-center gap-3 cursor-pointer">

            {/* Icon Container */}
            <div className="bg-black text-white p-2 rounded-lg transition-transform group-hover:rotate-3 group-hover:scale-110">
              <BsRobot size={20} />
            </div>

            {/* Brand Text */}
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              InterviewIQ<span className="text-blue-600">.AI</span>
            </h1>

          </div>
        </div>

        <div className=' flex items-center gap-6 relative'>
          <div className='relative'>
            <button onClick={() => {
              if(!userData){
                setShowAuth(true)
                return;
              }
              setShowCreditPopup(!showCreditPopup);
              setShowUserPopup(false)
            }} className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition'>
              <BsCoin size={20} />
              {userData?.credits || 0}
            </button>
            {showCreditPopup && (
              <div className='absolute right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50'>
                <p className='text-sm text-black mb-4'> Need more credits to continue interview?</p>
                <button onClick={() => navigate("/pricing")} className='w-full bg-black text-white py-2 rounded-lg text-sm'>Buy more credits</button>
              </div>
            )}
          </div>
          <div className='relative'>
            <button onClick={() => {
               if(!userData){
                setShowAuth(true)
                return;
              }
              setShowUserPopup(!showUserPopup);
              setShowCreditPopup(false)
            }} className='w-9 h-9 bg-black text-white flex items-center justify-center font-semibold rounded-full '>
              {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
            </button>
            {showUserPopup && (
              <div className='absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
                <p className='text-md text-blue-500 font-medium mb-1 '>{userData?.name}</p>
                <button onClick={() => navigate("/history")} className='w-full text-left text-sm py-2 hover:text-black text-gray-600'>InterView History</button>
                {
                  userData &&
                  <button onClick={handleLogout} className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 '> <HiOutlineLogout />Logout</button>
                }
                <Link to={'/auth'} className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 '> Signup</Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={()=>setShowAuth(false)}/>}
    </div>
  )
}

export default Navbar;
