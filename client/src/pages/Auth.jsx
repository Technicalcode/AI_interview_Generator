import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseConfigured, provider } from '../utils/firebase'; // Ensure path is correct
import { api } from '../utils/api';
import { useDispatch } from 'react-redux';
import { setUserData } from '../Redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Auth({isModel = false}) {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')

  const handleGoogleAuth = async () => {
    setAuthError('')

    if (!isFirebaseConfigured || !auth || !provider) {
      setAuthError('Google sign-in is not configured for this deployment. Add VITE_FIREBASE_APIKEY in GitHub Secrets.')
      return
    }

    try {
      const response = await signInWithPopup(auth, provider);
      let User = response.user
      let name = User.displayName
      let email = User.email
      const result = await api.post("/api/auth/google", { name, email })
      dispatch(setUserData(result.data))
      navigate('/')
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Unable to sign in right now.";
      console.error("Auth Error:", message);
      setAuthError(message);
      dispatch(setUserData(null))
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const boxVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 40 }, // scale 10 ko 0.9 kiya for better feel
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15
      }
    }
  };

  return (
    // Responsiveness: bg-slate-100 and items-center for all screen sizes
  <div className={`w-full ${isModel
  ? "py-4" 
  : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"
}`}>

      {/* 📦 Responsive Main Card Box */}
      <motion.div
        variants={boxVariants}
        initial="hidden"
        animate="visible"
        className={`w-full ${isModel
  ? "max-w-md p-8 rounded-3xl"
  : "max-w-lg p-12 rounded-[32px]"
} bg-white shadow-2xl border border-gray-200`}
      >

        {/* 1. Header Section */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="bg-green-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-green-500 shadow-inner">
            <Bot size={28} className="sm:w-9 sm:h-9" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            interviewIQ.<span className="text-green-500">AI</span>
          </h1>
        </motion.div>

        {/* 2. Continue Text */}
        <motion.div variants={itemVariants}>
          <p className="text-green-600 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8 drop-shadow-[0_2px_4px_rgba(34,197,94,0.2)] bg-green-50/80 py-2 rounded-full inline-block px-6 sm:px-8 border border-green-100">
            Continue with
          </p>
        </motion.div>

        {/* 3. Title with Sparkles */}
        <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          Ai Smart Interview
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="text-yellow-500 fill-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        </motion.h2>

        {/* 4. Paragraph (Approx 30 words) */}
        <motion.p variants={itemVariants} className="text-gray-500 leading-relaxed text-xs sm:text-sm px-1 sm:px-2 mb-8 sm:mb-10">
          Experience the next generation of hiring. Our AI-driven platform evaluates
          candidates with precision, offering deep insights and seamless automated
          screening to ensure you hire the best talent with total confidence.
        </motion.p>

        {/* 5. Google Button with Firebase Handler */}
        <motion.button
          variants={itemVariants}
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 bg-gray-100 border border-transparent py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl text-gray-800 text-sm sm:text-base font-bold shadow-sm transition-all duration-300"
        >
          <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </motion.button>

        {authError && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {authError}
          </p>
        )}

      </motion.div>
    </div>
  );
}

export default Auth;
