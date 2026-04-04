const express = require('express')
const router = express.Router()
const Group = require('../models/Group')
const User = require('../models/user')
const upload = require('../middleware/uploadLimits')
const faceClient = require('../services/faceClient')
const { userJwt } = require('../middleware/auth') // <--- CRITICAL: Uses your Auth Middleware

// --- JOIN GROUP (Logged In Users Only) ---
// Replaces the old enter-code / verify-otp flow
router.post('/join-group', userJwt, async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) return res.status(400).json({ message: 'Group code is required' })

    // 1. Find Group by Code
    const group = await Group.findOne({ code })
    if (!group) return res.status(404).json({ message: 'Invalid Group Code' })

    // 2. Check if already joined
    if (group.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already in this group' })
    }

    // 3. Add User to Group
    group.participants.push(req.user._id)
    await group.save()

    // 4. Add Group to User's joined list
    const user = await User.findById(req.user._id)
    if (!user.joinedGroups.includes(group._id)) {
      user.joinedGroups.push(group._id)
      await user.save()
    }

    res.json({ 
      message: 'Joined successfully!', 
      groupId: group._id, 
      name: group.name 
    })

  } catch(e) {
    console.error(e)
    res.status(500).json({ message: e.message })
  }
})

// --- SEARCH PHOTOS IN GROUP (Logged In Users Only) ---
// User uploads a selfie to find their photos in a specific group
router.post('/:groupCode/find-my-photos', userJwt, upload.single('selfie'), async (req, res) => {
  try {
    // 1. Find Group
    const group = await Group.findOne({ code: req.params.groupCode }).populate('photos')
    if (!group) return res.status(404).json({ message: 'Group not found' })

    // 2. Security Check: Is user a participant?
    // (Optional: remove this if you want to allow searching without joining)
    if (!group.participants.includes(req.user._id)) {
        return res.status(403).json({ message: 'You must join this group to search photos.' })
    }

    if (!req.file) return res.status(400).json({ message: 'Please upload a selfie' })

    // 3. Compute Embedding
    const embedResp = await faceClient.computeEmbeddingFromBuffer(req.file.buffer, req.file.originalname)
    const selfieEmbedding = embedResp.embedding
    if (!selfieEmbedding || selfieEmbedding.length === 0) {
      return res.status(400).json({ message: 'No face detected in selfie' })
    }

    // 4. Compare with Group Photos
    const threshold = parseFloat(process.env.MATCH_THRESHOLD || '0.48')
    const matches = []

    const missingEmbeddings = group.photos.filter((p) => {
      const hasMulti = Array.isArray(p.embeddings) && p.embeddings.length > 0
      const hasLegacy = Array.isArray(p.embedding) && p.embedding.length > 0
      return !hasMulti && !hasLegacy && !!p.url
    })

    if (missingEmbeddings.length > 0) {
      try {
        const bulk = await faceClient.computeBulkEmbeddingsFromUrls(missingEmbeddings.map((p) => p.url))
        const byUrl = new Map((bulk.items || []).map((it) => {
          const arr = Array.isArray(it.embeddings)
            ? it.embeddings
            : (Array.isArray(it.embedding) && it.embedding.length > 0 ? [it.embedding] : [])
          return [it.url, arr]
        }))

        for (const p of missingEmbeddings) {
          const arr = byUrl.get(p.url) || []
          if (arr.length > 0) {
            p.embeddings = arr
            await p.save()
          }
        }
      } catch (embedBackfillErr) {
        console.warn('Embedding backfill skipped:', embedBackfillErr.message)
      }
    }

    for (let p of group.photos) {
      const candidates = (Array.isArray(p.embeddings) && p.embeddings.length > 0)
        ? p.embeddings
        : (Array.isArray(p.embedding) && p.embedding.length > 0 ? [p.embedding] : [])

      if (candidates.length === 0) continue

      let bestScore = -1
      for (const candidate of candidates) {
        const score = faceClient.cosine(selfieEmbedding, candidate)
        if (score > bestScore) bestScore = score
      }

      if (bestScore >= threshold) {
        matches.push({ _id: p._id, url: p.url, score: bestScore })
      }
    }

    matches.sort((a, b) => b.score - a.score)
    res.json({ matches })

  } catch(e) { 
    console.error(e); 
    res.status(500).json({ message: e.message }) 
  }
})

module.exports = router