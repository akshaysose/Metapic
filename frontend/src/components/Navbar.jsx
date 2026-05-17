import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'

export default function Navbar() {
  const { profile, photToken, userToken, logout } = useContext(AuthContext)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  // Logic: Link to Photographer Dashboard or User Dashboard
  const dashboardLink = photToken ? '/photographer/dashboard' : '/dashboard';
  const isLoggedIn = !!profile || !!photToken || !!userToken

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-shadow ${scrolled ? 'shadow-xl bg-white/95 backdrop-blur' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <Link to="/" className="text-2xl font-bold text-primary">Metapic</Link>
          <a href="https://akshay-sose-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline">Contact Me</a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3">
          
          {/* --- CONDITIONAL BUTTON LOGIC --- */}
          {photToken ? (
            <Link to="/photographer/dashboard" className="px-3 py-2 border rounded text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white transition font-medium">
              + Create Group
            </Link>
          ) : (
            <Link to="/join" className="px-3 py-2 border rounded text-primary border-primary hover:bg-primary hover:text-white transition">
              Join Group
            </Link>
          )}
          {/* ------------------------------- */}

          {!isLoggedIn && (
            <>
              <Link to="/login" className="px-3 py-2 border rounded text-primary border-primary hover:bg-primary hover:text-white transition">Login</Link>
              <Link to="/signup" className="px-3 py-2 bg-yellow-400 rounded hover:bg-yellow-500 transition">Signup</Link>
            </>
          )}

          {isLoggedIn && (
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors" 
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <img
                  src={profile?.selfieUrl || profile?.avatarUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border"
                  onError={(e) => { e.target.onerror = null; }}
                />
                <span className="font-medium text-gray-700 text-sm">
                    {profile?.name || 'User'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {mobileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-1">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Profile</Link>
                  <Link to={dashboardLink} className="block px-4 py-2 hover:bg-gray-50 text-gray-700">My Groups</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 border rounded">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 shadow-inner">
          <div className="flex flex-col gap-2">
             {/* Mobile Button Logic */}
             {photToken ? (
                <Link to="/photographer/dashboard" className="px-3 py-2 border rounded text-teal-700 border-teal-700 font-bold text-center">
                  + Create Group
                </Link>
              ) : (
                <Link to="/join" className="px-3 py-2 border rounded text-primary border-primary text-center">
                  Join Group
                </Link>
              )}

            {!isLoggedIn && (
              <>
                <Link to="/login" className="px-3 py-2 border rounded text-primary border-primary">Login</Link>
                <Link to="/signup" className="px-3 py-2 bg-yellow-400 rounded">Signup</Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link to="/profile" className="px-3 py-2 border rounded">Profile</Link>
                <Link to={dashboardLink} className="px-3 py-2 border rounded">My Groups</Link>
                  <a href="https://akshay-sose-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 border rounded text-center">Contact Me</a>
                <button onClick={handleLogout} className="px-3 py-2 border rounded text-left text-red-600">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}