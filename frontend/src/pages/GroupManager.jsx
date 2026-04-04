import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

// --- HELPER 1: PARALLEL QUEUE ---
async function processQueue(items, concurrency, task) {
  let index = 0;
  const results = [];
  const run = async () => {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      try {
        await task(item, i);
      } catch (err) {
        console.error(`Error processing item ${i}:`, err);
      }
    }
  };
  const threads = Array.from({ length: concurrency }, run);
  await Promise.all(threads);
  return results;
}

// --- HELPER 2: NATIVE IMAGE COMPRESSION (No Library Needed) ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920; // Standard HD Width
        const scaleSize = MAX_WIDTH / img.width;
        
        // Calculate new dimensions (keep aspect ratio)
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG at 70% quality
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          // Recreate File object
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.7); 
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

export default function GroupManager() {
  const { code } = useParams();
  const { photToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('photos'); 
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const API = import.meta.env.VITE_API || 'http://localhost:5000';

  // Fetch Group Data
  const fetchGroup = async () => {
    try {
      const res = await axios.get(`${API}/api/photographer/group/${code}`, {
        headers: { Authorization: `Bearer ${photToken}` }
      });
      setGroup(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (photToken && code) fetchGroup(); }, [photToken, code]);

  // --- UPDATED UPLOAD LOGIC ---
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setProgress({ current: 0, total: files.length });

    const processFile = async (file) => {
      const formData = new FormData();
      try {
        // 1. Compress File (Native Browser API)
        // Only compress if larger than 1MB to save time
        let fileToUpload = file;
        if (file.size > 1024 * 1024) {
            // console.log(`Compressing ${file.name}...`); // Optional debug
            fileToUpload = await compressImage(file);
        }

        formData.append('photos', fileToUpload);

        // 2. Upload to Backend
        await axios.post(`${API}/api/photographer/group/${group.code}/upload`, formData, {
          headers: { 
              Authorization: `Bearer ${photToken}`,
              'Content-Type': 'multipart/form-data'
          },
          timeout: 180000 // 3 Minutes Timeout (per batch of 3)
        });

        // 3. Update Progress
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));

      } catch (error) {
        console.error(`Failed to upload ${file.name}`, error);
      }
    };

    try {
      // Run 3 uploads at a time (Parallel)
      await processQueue(files, 3, processFile);
      
      alert('All uploads complete!');
      window.location.reload();

    } catch (e) {
      alert("Batch upload finished with errors. Check console.");
    } finally {
      setUploading(false);
    }
  };

  // Toggle Photo Selection
  const toggleSelect = (id) => {
    if (selectedPhotos.includes(id)) {
        setSelectedPhotos(selectedPhotos.filter(pid => pid !== id));
    } else {
        setSelectedPhotos([...selectedPhotos, id]);
    }
  };

  // Delete Logic
  const handleDeleteSelected = async () => {
    if(!confirm(`Delete ${selectedPhotos.length} photos?`)) return;
    try {
        await axios.post(`${API}/api/photographer/group/${code}/delete-photos`, 
            { photoIds: selectedPhotos },
            { headers: { Authorization: `Bearer ${photToken}` } }
        );
        setSelectedPhotos([]);
        fetchGroup(); 
    } catch (e) { alert("Delete failed"); }
  };

  const handleDeleteAllPhotos = async () => {
    if(!confirm("WARNING: Delete ALL photos? Cannot be undone.")) return;
    try {
        await axios.post(`${API}/api/photographer/group/${code}/delete-photos`, 
            { deleteAll: true },
            { headers: { Authorization: `Bearer ${photToken}` } }
        );
        setSelectedPhotos([]);
        fetchGroup(); 
    } catch (e) { alert("Delete failed"); }
  };

  const handleDeleteGroup = async () => {
    const confirmName = prompt(`Type "${group.name}" to confirm deletion:`);
    if (confirmName !== group.name) return;

    try {
        await axios.delete(`${API}/api/photographer/group/${code}`, {
            headers: { Authorization: `Bearer ${photToken}` }
        });
        alert("Group deleted.");
        navigate('/photographer/dashboard'); 
    } catch (e) { alert("Delete failed: " + e.message); }
  };


  if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!group) return null;

  const joinLink = `${window.location.origin}/join/${group.code}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-gray-500">Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{group.code}</span></p>
        </div>
        <button onClick={handleDeleteGroup} className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 text-sm font-semibold">
            Delete Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {['photos', 'members', 'share'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded capitalize font-medium ${activeTab === tab ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* --- PHOTOS TAB --- */}
      {activeTab === 'photos' && (
        <div>
           <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
             <div className="flex gap-2 flex-wrap">
                <label className={`bg-teal-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-teal-700 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploading ? 'Processing...' : 'Upload Photos'}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading}/>
                </label>
                
                {selectedPhotos.length > 0 ? (
                    <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Delete Selected ({selectedPhotos.length})
                    </button>
                ) : (
                    group.photos?.length > 0 && (
                        <button onClick={handleDeleteAllPhotos} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Delete All</button>
                    )
                )}
             </div>
             <p className="text-sm text-gray-500">{group.photos?.length || 0} photos</p>
           </div>

           {/* --- PROGRESS BAR --- */}
           {uploading && (
              <div className="mb-6 w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner relative">
                <div 
                  className="bg-teal-600 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-bold" 
                  style={{ width: `${Math.max(5, (progress.current / progress.total) * 100)}%` }}
                >
                    {Math.round((progress.current / progress.total) * 100)}%
                </div>
                <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 font-medium">
                  Compressing & Uploading {progress.current} of {progress.total}...
                </p>
              </div>
           )}

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {group.photos && group.photos.map(photo => (
               <div 
                 key={photo._id} 
                 className={`relative aspect-square cursor-pointer group rounded overflow-hidden border-4 ${selectedPhotos.includes(photo._id) ? 'border-teal-500' : 'border-transparent'}`}
                 onClick={() => toggleSelect(photo._id)}
               >
                 <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                 <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${selectedPhotos.includes(photo._id) ? 'bg-teal-500' : 'bg-black/30'}`}>
                    {selectedPhotos.includes(photo._id) && <span className="text-white text-xs">✓</span>}
                 </div>
               </div>
             ))}
           </div>
           
           {(!group.photos || group.photos.length === 0) && (
             <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500">No photos yet. Click "Upload Photos" to start.</p>
             </div>
           )}
        </div>
      )}

      {/* --- MEMBERS TAB --- */}
      {activeTab === 'members' && (
        <div>
            <h3 className="text-xl font-semibold mb-4">Joined Users ({group.participants?.length || 0})</h3>
            <div className="bg-white rounded shadow overflow-hidden">
                {(!group.participants || group.participants.length === 0) ? (
                    <div className="p-8 text-center text-gray-500">No members yet.</div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selfie Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {group.participants.map(user => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.selfieUrl ? 
                                            <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">Uploaded</span> : 
                                            <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-xs">Pending</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      )}

      {/* --- SHARE TAB --- */}
      {activeTab === 'share' && (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded shadow text-center">
            <h3 className="text-xl font-bold mb-4">Invite Guests</h3>
            <div className="mb-6 p-4 bg-white border rounded shadow-sm">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinLink)}`} 
                    alt="QR Code" 
                    className="w-48 h-48"
                />
            </div>
            <div className="flex gap-2 w-full max-w-md">
                <input readOnly value={joinLink} className="border p-2 rounded flex-1 bg-gray-50 text-gray-600 text-sm"/>
                <button onClick={() => {navigator.clipboard.writeText(joinLink); alert('Copied!');}} className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">Copy</button>
            </div>
        </div>
      )}
    </div>
  );
}