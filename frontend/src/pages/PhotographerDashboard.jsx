import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function PhotographerDashboard() {
  const { photToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Create Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const API = import.meta.env.DEV
    ? 'http://localhost:4000'
    : (import.meta.env.VITE_API || 'http://localhost:4000');

  // Fetch Groups
useEffect(() => {
    const fetchGroups = async () => {
      try {
        // URL is /api/photographer/my-groups
        const res = await axios.get(`${API}/api/photographer/my-groups`, {
          headers: { Authorization: `Bearer ${photToken}` }
        });
        setGroups(res.data);
      } catch (e) {
        console.error("Error fetching groups:", e);
      }
    };
    if (photToken) fetchGroups();
  }, [photToken]);

  // Handle Create Group
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // CHANGED URL TO: /api/photographer/create-group
      const res = await axios.post(`${API}/api/photographer/create-group`, 
        { name: newGroupName },
        { headers: { Authorization: `Bearer ${photToken}` } }
      );
      
      // Update list instantly
      setGroups([res.data, ...groups]); 
      setShowModal(false);
      setNewGroupName('');
      
    } catch (e) {
      alert(e.response?.data?.message || "Error creating group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Collections</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white px-6 py-2 rounded shadow hover:bg-teal-700 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span> Create New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group._id} className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200 overflow-hidden"
               onClick={() => navigate(`/photographer/group/${group.code}`)}>
            <div className="h-48 bg-gray-200 flex items-center justify-center relative">
               {/* Cover Photo logic or Placeholder */}
               <div className="text-4xl text-gray-400">📷</div>
               <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                 Code: {group.code}
               </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{group.name}</h3>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{group.photoCount || 0} Photos</span>
                <span>{group.participantCount || 0} Members</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreate}>
              <input 
                className="w-full border p-2 rounded mb-4 focus:border-teal-500 outline-none"
                placeholder="Event Name (e.g. Sarah's Wedding)"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}