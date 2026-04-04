const express = require('express')
const router = express.Router()
const Photo = require('../models/Photo')
const Group = require('../models/Group')
const jwt = require('jsonwebtoken')

// download or get URL if authorized
router.get('/:photoId/download', async (req,res)=>{
  try {
    const photo = await Photo.findById(req.params.photoId).populate('group')
    if (!photo) return res.status(404).json({ message: 'Not found' })
    // check client token or owner (photographer)
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'Missing auth' })
    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // photographers can access if they own the group
    if (payload.id) {
      if (payload.id === photo.group.photographer.toString()) return res.json({ url: photo.url })
    }
    // clients: must be client token with same groupCode
    if (payload.client && payload.groupCode === photo.group.code) return res.json({ url: photo.url })
    res.status(403).json({ message: 'Forbidden' })
  } catch(e){ res.status(500).json({ message: e.message }) }
})

module.exports = router
