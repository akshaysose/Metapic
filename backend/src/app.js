const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
require('./config/loadEnv')
const clientRoutes = require('./routes/client')
const photoRoutes = require('./routes/photo')
const userroutes = require('./routes/Usersignup')
const photographerroute = require('./routes/photographersignup')
const userdashboard = require('./routes/userdashboard')
const photographerGroup=require('./routes/photographerGroups')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected'))
  .catch(err=>console.error('Mongo connect err',err))

const app = express()
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000","https://metapic.vercel.app","https://metapic.org",         // <--- Your NEW Domain
        "https://www.metapic.org"], // Allow both Vite and React ports + localhost variants
    credentials: true, // Important for cookies/headers
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Simple health check endpoint for cron-job.org
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// security
const limiter = rateLimit({ windowMs: 60*1000, max: 120 })
app.use(limiter)

// routes

app.use('/api/client', clientRoutes)
app.use('/api/photo', photoRoutes)
app.use('/api',userroutes)
app.use('/api',photographerroute)
app.use('/api',userdashboard)
app.use('/api/photographer',photographerGroup)
// health
app.get('/health', (req,res)=>res.json({ ok:true }))
module.exports = app
