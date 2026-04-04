import React from 'react'

export default function PhotoGrid({ photos }) {
  if (!photos || photos.length === 0) return <div>No matches found.</div>
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {photos.map(p => (
        <div key={p._id} className="bg-white rounded shadow p-2">
          <img src={p.url} alt="" className="w-full h-40 object-cover rounded" />
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm mt-2 block text-primary">Download</a>
        </div>
      ))}
    </div>
  )
}
