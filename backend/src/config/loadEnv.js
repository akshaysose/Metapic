const path = require('path')
const dotenv = require('dotenv')

// Load root .env first so docker-compose style/shared values are available.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
// In local development, prefer backend/.env values over inherited shell vars.
// In production, keep platform-provided env vars as the source of truth.
dotenv.config({
	path: path.resolve(__dirname, '../../.env'),
	override: process.env.NODE_ENV !== 'production'
})
