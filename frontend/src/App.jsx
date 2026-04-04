import React from 'react'
import { Routes, Route } from 'react-router-dom'

// --- Pages ---
import Home from './pages/Home' // Optional: Can be your landing page
import Auth from './pages/Auth' // Handles Login & Signup
import Profile from './pages/Profile' 

// --- User Pages ---
import UserDashboard from './pages/UserDashboard'
import UserGroupView from './pages/UserGroupView' // <--- This fixes the blank page
import ClientJoin from './pages/ClientJoin'
import MagicJoin from './pages/MagicJoin'

// --- Photographer Pages ---
import PhotographerDashboard from './pages/PhotographerDashboard'
import GroupManager from './pages/GroupManager'

// --- Components ---
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-lightcyan text-deepblue">
      <Navbar />
      
      <main className="p-4 pt-24">
        <Routes>

          {/* --- Authentication --- */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* --- User Routes --- */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/join" element={<ClientJoin />} />
          <Route path="/join/:code" element={<MagicJoin />} />
          
          {/* THE MISSING LINK (Gallery View) */}
          <Route path="/group/:code" element={<UserGroupView />} />


          {/* --- Photographer Routes --- */}
          <Route path="/photographer/dashboard" element={<PhotographerDashboard />} />
          <Route path="/photographer/group/:code" element={<GroupManager />} />


          {/* --- Default / Home Routes --- */}
          <Route path="/profile" element={<Profile />} />
          
          {/* If logged in, you usually want dashboard. If not, Home. 
              For now, let's keep Home at root to avoid conflicts. */}
          <Route path="/" element={<Home />} />

        </Routes>
      </main>
    </div>
  )
}