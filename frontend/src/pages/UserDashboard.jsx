import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function UserDashboard() {
  const { userToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API = import.meta.env.DEV
    ? 'http://localhost:4000'
    : (import.meta.env.VITE_API || 'http://localhost:4000');

  // Fetch User's Groups on Load
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API}/api/user/my-groups`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setGroups(res.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) fetchGroups();
  }, [userToken]);

  // Filter groups based on search
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        
        {/* Title & Search */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h1 className="text-2xl font-semibold text-gray-800">Groups</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-1 border-b border-gray-300 focus:border-teal-600 focus:outline-none text-sm transition-colors"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-0 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
             {/* List View Icon (Optional) */}
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <Link 
            to="/join" 
            className="bg-teal-50 text-teal-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-100 transition-colors border border-teal-100"
          >
            Join a Group
          </Link>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading your groups...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
          <Link to="/join" className="text-teal-600 font-medium hover:underline">Join your first group</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="group cursor-pointer" onClick={() => navigate(`/group/${group.code}`)}>
              
              {/* Card Image Container */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
                {group.coverPhoto || group.coverUrl ? (
                   <img 
                     src={group.coverPhoto || group.coverUrl} 
                     alt={group.name} 
                     className="w-full h-full object-cover"
                   />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300">
                     {/* Placeholder Icon */}
                     <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                   </div>
                )}

                {/* Photo Count Badge (Bottom Right) */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {group.photoCount}
                </div>
              </div>

              {/* Card Info */}
              <h3 className="font-bold text-gray-900 text-lg truncate">{group.name}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Custom Access
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                   {group.participantCount} Participants
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}