import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { AuthContext } from '../AuthContext'

export default function Profile() {
  const { profile, userToken, photToken, setProfile } = useContext(AuthContext)
  
  // Local state for file upload
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const API = import.meta.env.DEV
    ? 'http://localhost:4000'
    : (import.meta.env.VITE_API || 'http://localhost:4000')

  // Determine current avatar to show (Preview > Profile Data > Placeholder)
  const currentAvatar = previewUrl || profile?.selfieUrl || profile?.avatarUrl || 'https://via.placeholder.com/150'

  if (!profile) return <div className="text-center mt-10">Loading profile...</div>

  // Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile)) // Show immediate preview
      setMessage('')
    }
  }

  // Handle Upload API Call
  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('avatar', file) // 'avatar' must match backend middleware

    try {
      // Determine Endpoint & Token based on who is logged in
      const isPhotographer = !!photToken
      const token = isPhotographer ? photToken : userToken
      const endpoint = isPhotographer 
        ? `${API}/api/photographer/upload-avatar` 
        : `${API}/api/user/upload-avatar`

      const res = await axios.post(endpoint, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })

      // Update Global Context so Navbar updates instantly
      const newUrl = res.data.url
      const updatedProfile = { ...profile, [isPhotographer ? 'avatarUrl' : 'selfieUrl']: newUrl }
      
      setProfile(updatedProfile)
      // Update local storage to persist changes on refresh
      localStorage.setItem('profile', JSON.stringify(updatedProfile))

      setMessage('Profile picture updated successfully!')
      setFile(null) // Reset file input
      setLoading(false)

    } catch (error) {
      console.error(error)
      setMessage('Error uploading image. Please try again.')
      setLoading(false)
    }
  }

  // Cancel Selection
  const handleCancel = () => {
    setFile(null)
    setPreviewUrl(null)
    setMessage('')
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Profile</h2>

      <div className="flex flex-col items-center mb-8">
        {/* Avatar Image */}
        <div className="relative w-40 h-40 mb-4">
         <img
             src={currentAvatar}
            alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-teal-600 shadow-sm"
           onError={(e) => {
           e.target.onerror = null; // Stop the loop
            // This is a simple gray user icon in Base64 - it works offline
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E";
            }}
         />
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            id="avatarInput" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Camera Icon / Edit Button */}
          {!file && (
            <label 
              htmlFor="avatarInput" 
              className="absolute bottom-2 right-2 bg-teal-700 text-white p-2 rounded-full cursor-pointer hover:bg-teal-800 transition shadow"
              title="Change Profile Photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          )}
        </div>

        {/* Upload Actions (Only show if file is selected) */}
        {file && (
          <div className="flex gap-3 mb-4 animate-fade-in">
            <button 
              onClick={handleUpload} 
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Save Photo'}
            </button>
            <button 
              onClick={handleCancel} 
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 gap-4 border-t pt-6">
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-600">Name:</span>
          <span className="text-gray-800">{profile.name}</span>
        </div>
        
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-600">Email:</span>
          <span className="text-gray-800">{profile.email}</span>
        </div>

        {profile.businessName && (
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">Business Name:</span>
            <span className="text-gray-800">{profile.businessName}</span>
          </div>
        )}

        {profile.role && (
           <div className="flex justify-between border-b pb-2">
           <span className="font-semibold text-gray-600">Account Type:</span>
           <span className="text-gray-800 capitalize">{profile.role || 'User'}</span>
         </div>
        )}
      </div>
    </div>
  )
}