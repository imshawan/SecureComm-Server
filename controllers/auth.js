const passport = require('passport');
const { utilities } = require('../utils');
const { User, OTP } = require('../models');
const { authentication } = require('../middlewares');

const config = require('../app.config');

const userAuth = module.exports;

userAuth.get = (req, res, next) => {
    User.find({}, (err, users) => {
      if (err) {
        return next(err);
      } else {
        utilities.handleApiResponse(200, res, users);
      }
    })
  }

userAuth.registerUser = (req, res, next) => {
    OTP.findOne({otp: req.body.otp})
    .then((otp) => {
      if (!otp) {
        return utilities.handleApiResponse(400, res, new Error('Invalid OTP!'));
      }
      if (req.body.email != otp.email) {
        return utilities.handleApiResponse(400, res, new Error('Email provided does not match with the previous one'));
      }
      currentTime = Date.now();
      if (parseInt(currentTime) >= parseInt(otp.expiresIn)) {
          OTP.findByIdAndRemove(otp._id)
          .then((e) => (e))
          return utilities.handleApiResponse(400, res, new Error('This OTP has expired'));
      }
  
      User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if (err){
          return utilities.handleApiResponse(400, res, new Error(err));
        }
        else {
            user.email = req.body.email;
            user.firstname = req.body.firstname;
            user.lastname = req.body.lastname;
            user.acceptedTerms = req.body.acceptedTerms;
            user.save((err, user) => {
            if (err) {
              return utilities.handleApiResponse(400, res, new Error(err));
            }
            passport.authenticate('local')(req, res, () => {
              OTP.findByIdAndRemove(otp._id)
              .then((e) => (e))
              return utilities.handleApiResponse(200, res, { message: 'You have successfully signed up!' });
          });
        });
      }
    });
    }, (err) => {})
  }

userAuth.sendOTP = (req, res, next) => {
    var token = utilities.generateOtp(6)
  
    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        var payload = {}
        payload.otp = token;
        payload.email = req.body.email;
        payload.expiresIn = Date.now() + 300000; // 5 min
  
        OTP.create(payload).then(() => {
            utilities.handleApiResponse(200, res, {message: 'An e-mail with OTP has been sent to ' + req.body.email + '.'})
        }).catch((err) => {
            utilities.handleApiResponse(400, res, new Error(err));
        })
        
      }
      else {
        utilities.handleApiResponse(400, res, new Error('An account with that email address already exists'));
      }
    })
  
  }

  userAuth.signIn = (req, res, next) => {
    const token = authentication.getToken({_id: req.user._id}, req.body.remember_me);
    if (token) {
      const payload = {
        token, message: 'You have successfully logged in!'
      };
      User.findById({_id: req.user._id}, (err, user) => {
        if (err) {
          return utilities.handleApiResponse(400, res, new Error(err));
        } else {
          payload.user = user;
          utilities.handleApiResponse(200, res, payload);
        }
      });
    } else {
      utilities.handleApiResponse(400, res, {message: "Something went wrong!"});
    }
  }