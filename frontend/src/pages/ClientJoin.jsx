import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../AuthContext'

export default function ClientJoin() {
  const { userToken, setUserToken } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true) // New state to prevent instant redirect
  const [error, setError] = useState('')

  const API = import.meta.env.VITE_API || 'http://localhost:5000'

  // Step 1: ROBUST Security Check
  useEffect(() => {
    // Check both Context AND LocalStorage to prevent false redirects
    const storedToken = localStorage.getItem('userToken');

    if (userToken || storedToken) {
      // User is definitely logged in
      if (!userToken && storedToken) {
        // Edge case: If Context is empty but LocalStorage has token, sync them manually
        setUserToken(storedToken);
      }
      setInitializing(false); // Stop loading, show the form
    } else {
      // User is definitely NOT logged in
      // The 'state' tells the login page to send them back here after they log in
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [userToken, navigate, location, setUserToken])

  // Step 2: Join Logic
  async function handleJoin(e) {
    e.preventDefault()
    if (!code) return setError('Please enter the 6-digit code')

    setLoading(true)
    setError('')

    // --- DEBUGGING START ---
    const tokenUsed = userToken || localStorage.getItem('userToken');
    
    console.log("---------------------------------");
    console.log("ATTEMPTING JOIN REQUEST");
    console.log("Code:", code);
    console.log("Token being sent:", tokenUsed); // <--- LOOK AT THIS IN CONSOLE
    console.log("---------------------------------");

    if (!tokenUsed) {
        setLoading(false);
        setError("Error: You are not logged in (No Token Found)");
        // Optional: force redirect
        setTimeout(() => navigate('/login'), 2000);
        return;
    }
    // --- DEBUGGING END ---

    try {
      const res = await axios.post(
        `${API}/api/client/join-group`, 
        { code },
        { headers: { Authorization: `Bearer ${tokenUsed}` } }
      )

      alert(`Successfully joined: ${res.data.name}`)
      navigate('/dashboard')

    } catch (err) {
      console.error("FULL ERROR OBJECT:", err); // This helps see the backend response
      setError(err.response?.data?.message || 'Failed to join group')
    } finally {
      setLoading(false)
    }
  }

  // Show a loader while we check auth (prevents the "flicker" or loop)
  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join a Group</h2>
        <p className="text-gray-500 mb-8">Enter the unique 6-digit code provided by the photographer.</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input 
              type="text" 
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="ENTER CODE" 
              maxLength={6}
              className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition uppercase"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || code.length < 4}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </form>

        <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline"
        >
            Cancel
        </button>
      </div>
    </div>
  )
}