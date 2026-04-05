const axios = require('axios')
const FormData = require('form-data')

const FACE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:8000'

function normalizeEmbeddings(payload = {}) {
  if (Array.isArray(payload.embeddings)) {
    return payload.embeddings.filter((e) => Array.isArray(e) && e.length > 0)
  }
  if (Array.isArray(payload.embedding) && payload.embedding.length > 0) {
    return [payload.embedding]
  }
  return []
}

module.exports = {
  computeEmbeddingFromBuffer: async (buffer, filename='blob.jpg') => {
    try {
      const form = new FormData()
      form.append('file', buffer, { filename })
      const res = await axios.post(`${FACE_URL}/embed`, form, { headers: form.getHeaders(), timeout: 60000 })
      const embeddings = normalizeEmbeddings(res.data)
      return {
        ...res.data,
        embedding: embeddings[0] || [],
        embeddings
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || err.code || err.message
      throw new Error(`Face service unreachable at ${FACE_URL}/embed (${detail})`)
    }
  },
  computeBulkEmbeddingsFromUrls: async (urls) => {
    try {
      // For convenience; face-service supports URL or file
      const res = await axios.post(`${FACE_URL}/embed-urls`, { urls }, { timeout: 600000 })
      return res.data
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || err.code || err.message
      throw new Error(`Face service unreachable at ${FACE_URL}/embed-urls (${detail})`)
    }
  },
  cosine: (a,b) => {
    if(!a||!b) return 0
    const dot = a.reduce((s,ai,i)=>s+ai*(b[i]||0),0)
    const na = Math.sqrt(a.reduce((s,x)=>s+x*x,0))
    const nb = Math.sqrt(b.reduce((s,x)=>s+x*x,0))
    if (!na || !nb) return 0
    return dot/(na*nb)
  }
}
