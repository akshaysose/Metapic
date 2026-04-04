const multer = require('multer')
const upload = multer({
  // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false)
    cb(null, true)
  }
})
module.exports = upload
