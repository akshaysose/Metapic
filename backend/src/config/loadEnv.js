const path = require('path')
const dotenv = require('dotenv')

// Load root .env first so docker-compose style/shared values are available.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
// Load backend/.env next but keep existing values by default (override: false).
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
