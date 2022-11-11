const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const {Session} = require('../models');

const {utilities} = require('../utils');
const { User } = require('../models');
const config = require('../app.config');

const opts = {}; 

passport.use(new LocalStrategy(User.authenticate()));
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user, remember_me) {
    // Remember me for 10 days max
    // const ExpirationTime = remember_me ? '10d' : config.expiresIn;
    return jwt.sign(user, config.secretKey);
        // { expiresIn: ExpirationTime });
};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = async function (req, res, next) {
    const authorizationToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    passport.authenticate('jwt', {session: false}, async function (err, user) {
        if (err || !user) {
            return utilities.handleApiResponse(401, res, new Error('Unauthorized! A valid token was not found with this request'));
        }
        let session = await Session.findOne({user: user._id});
        if (!session || session.token != authorizationToken) {
            return utilities.handleApiResponse(401, res, new Error('Unable to verify the token! Please retry logging in'));
        }
        req.user = user;

        next();
    })(req, res, next);
}