const LocalStrategy = require('passport-local').Strategy
const Photographer = require('../src/models/Photographer')
const bcrypt = require('bcryptjs')

module.exports = function(passport){
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await Photographer.findOne({ email })
      if (!user) return done(null, false, { message: 'No user' })
      const match = await bcrypt.compare(password, user.passwordHash)
      if (!match) return done(null, false, { message: 'Incorrect password' })
      return done(null, user)
    } catch (e) { done(e) }
  }))
}
