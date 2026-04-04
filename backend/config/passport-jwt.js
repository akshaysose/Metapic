const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const Photographer = require('../src/models/Photographer')

module.exports = function(passport){
  const opts = { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET }
  passport.use(new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await Photographer.findById(payload.id).select('-passwordHash')
      if (user) return done(null, user)
      return done(null, false)
    } catch (e) { done(e, false) }
  }))
}
