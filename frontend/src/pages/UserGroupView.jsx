import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { AuthContext } from '../AuthContext';

export default function UserGroupView() {
  const { code } = useParams();
  const { userToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [myPhotos, setMyPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // New Error State
  const [searching, setSearching] = useState(false);
  const [selfie, setSelfie] = useState(null);

  const API = import.meta.env.VITE_API || 'http://localhost:5000';

  // 1. Fetch Group Data
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await axios.get(`${API}/api/user/group/${code}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setGroup(res.data);
      } catch (e) {
        console.error("Load Error:", e);
        // Capture the specific message from backend (e.g., "Access Denied")
        setError(e.response?.data?.message || "Failed to load group");
      } finally {
        setLoading(false);
      }
    };
    
    if (userToken) fetchGroup();
  }, [code, userToken]);

  // 2. Handle Selfie Search
  const handleSearch = async () => {
    if (!selfie) return alert("Please select a selfie first");
    
    setSearching(true);
    const formData = new FormData();
    formData.append('selfie', selfie);

    try {
      const res = await axios.post(`${API}/api/user/group/${code}/search`, formData, {
        headers: { 
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      
      setMyPhotos(res.data.matches);
      setActiveTab('mine');
      alert(`Found ${res.data.matches.length} matches!`);
      
    } catch (e) {
      alert(e.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  // --- RENDER LOGIC ---

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading Gallery...</div>;

  // Show the ACTUAL error message
  if (error) return (
    <div className="text-center mt-20 p-6 bg-red-50 border border-red-100 max-w-lg mx-auto rounded-lg">
        <h3 className="text-red-700 font-bold text-xl mb-2">Unable to View Group</h3>
        <p className="text-gray-700 mb-4">{error}</p>
        
        {/* If Access Denied, show Join Button */}
        {error.includes("join") && (
            <button 
                onClick={() => navigate('/join')}
                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
            >
                Go to Join Page
            </button>
        )}
    </div>
  );

  if (!group) return <div className="text-center mt-20">Group not found (Unknown Error)</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-gray-500 text-sm">Event Code: {group.code}</p>
        </div>
        
        {/* Selfie Upload Section */}
        <div className="flex items-center gap-2 bg-teal-50 p-2 rounded-lg border border-teal-100">
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelfie(e.target.files[0])}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200"
            />
            <button 
                onClick={handleSearch} 
                disabled={!selfie || searching}
                className={`px-4 py-2 rounded-full text-white font-bold text-sm transition ${!selfie ? 'bg-gray-300' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
                {searching ? 'Scanning...' : 'Find Me 🔍'}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-8">
        <button 
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 font-semibold transition ${activeTab === 'all' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            All Photos ({group.photos?.length || 0})
        </button>
        <button 
            onClick={() => setActiveTab('mine')}
            className={`pb-2 px-4 font-semibold transition ${activeTab === 'mine' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            My Photos ({myPhotos.length})
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        {/* VIEW: MY PHOTOS */}
        {activeTab === 'mine' && (
            myPhotos.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-2">No matches found yet.</p>
                    <p className="text-sm text-gray-400">Upload a clear selfie above to find your photos.</p>
                </div>
            ) : (
                myPhotos.map(photo => (
                    <div key={photo._id} className="relative group aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 shadow hover:shadow-lg transition">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <a href={photo.url} download target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow">
                            ⬇️
                        </a>
                    </div>
                ))
            )
        )}

        {/* VIEW: ALL PHOTOS */}
        {activeTab === 'all' && (
             group.photos?.map(photo => (
                <div key={photo._id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:opacity-90 transition">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
            ))
        )}

      </div>
    </div>
  );
}