import React, {useState} from 'react'
import axios from 'axios'

export default function CreateGroup(){
  const [name,setName] = useState('')
  const [files,setFiles] = useState(null)

  async function create(e){
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(import.meta.env.VITE_API + '/api/groups', { name }, { headers: { Authorization: `Bearer ${token}` } })
      const group = res.data
      if (files && files.length) {
        const fd = new FormData()
        for (let f of files) fd.append('photos', f)
        await axios.post(`${import.meta.env.VITE_API}/api/groups/${group._id}/upload`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
      }
      alert('Group created: ' + group.code)
    } catch(e){ alert(e.response?.data?.message || e.message) }
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Create Group</h3>
      <form onSubmit={create}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Group name" className="w-full p-2 border rounded mb-3"/>
        <input type="file" multiple accept="image/*" onChange={e=>setFiles(e.target.files)} className="mb-3"/>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Create</button>
        </div>
      </form>
    </div>
  )
}
