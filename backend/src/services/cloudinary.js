const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = {
  uploadStream: (stream, opts={}) => {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(opts, (err, result)=> {
        if (err) return reject(err)
        resolve(result)
      })
      stream.pipe(upload)
    })
  },
  uploadFile: (path, opts={}) => cloudinary.uploader.upload(path, opts),
  getUrl: (publicId, opts={}) => cloudinary.url(publicId, opts)
}
