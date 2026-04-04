import React, {useState} from 'react'
import axios from 'axios'
import PhotoGrid from '../components/PhotoGrid'
import { useParams } from 'react-router-dom'

export default function ClientMatches(){
  const { code } = useParams()
  const [photos, setPhotos] = useState([])
  const [file, setFile] = useState(null)

  async function uploadSelfie(){
    const clientToken = localStorage.getItem('clientToken')
    const fd = new FormData()
    fd.append('selfie', file)
    const res = await axios.post(`${import.meta.env.VITE_API}/api/client/${code}/upload-selfie`, fd, {
      headers: { 'Authorization': `Bearer ${clientToken}`, 'Content-Type': 'multipart/form-data' }
    })
    setPhotos(res.data.matches || [])
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Upload selfie to find your photos</h3>
      <div className="bg-white p-4 rounded shadow mb-4">
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} className="mb-3"/>
        <button onClick={uploadSelfie} className="px-4 py-2 bg-primary text-white rounded">Find Matches</button>
      </div>
      <PhotoGrid photos={photos} />
    </div>
  )
}
