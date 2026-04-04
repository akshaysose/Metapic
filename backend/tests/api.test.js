const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')

beforeAll(async ()=> {
  // use test DB
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kwikpic_test')
})

afterAll(async ()=> {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

test('health check', async ()=>{
  const res = await request(app).get('/health')
  expect(res.statusCode).toBe(200)
  expect(res.body.ok).toBe(true)
})
