const passport = require('passport');
const { utilities } = require('../utils');
const { User, OTP } = require('../models');
const { authentication } = require('../middlewares');
const { generators } = require('../utils');

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
    // OTP.findOne({otp: req.body.otp})
    // .then((otp) => {
    //   if (!otp) {
    //     return utilities.handleApiResponse(400, res, new Error('Invalid OTP!'));
    //   }
    //   if (req.body.email != otp.email) {
    //     return utilities.handleApiResponse(400, res, new Error('Email provided does not match with the previous one'));
    //   }
    //   currentTime = Date.now();
    //   if (parseInt(currentTime) >= parseInt(otp.expiresIn)) {
    //       OTP.findByIdAndRemove(otp._id)
    //       .then((e) => (e))
    //       return utilities.handleApiResponse(400, res, new Error('This OTP has expired'));
    //   }
  
      
    // }, (err) => {})
    const { username, password, email } = req.body;
    const { firstName, lastName } = generators.generateRanzomizedName();

    User.register(new User({username}), password, (err, user) => {
      if (err){
        return utilities.handleApiResponse(400, res, new Error(err));
      }
      else {
          user.email = email;
          user.firstName = firstName;
          user.lastName = lastName;
          // user.acceptedTerms = req.body.acceptedTerms;
          user.save((err, user) => {
          if (err) {
            return utilities.handleApiResponse(400, res, new Error(err));
          }
          passport.authenticate('local')(req, res, () => {
            return utilities.handleApiResponse(200, res, { message: 'You have successfully signed up!' });
        });
      });
    }
  });
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
          payload.user = user && user._doc ? user._doc : {};
          if (payload.user.payload) {
            delete payload.user.payload;
          }
          utilities.handleApiResponse(200, res, payload);
        }
      });
    } else {
      utilities.handleApiResponse(400, res, {message: "Something went wrong!"});
    }
  }

  userAuth.forgotPassword = (req, res) => {
    let token = utilities.generateOtp(6);
  
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return utilities.handleApiResponse(404, res, new Error('Account with that email address doesn\'t exists'));
      }
      var payload = {}
      payload.passwordToken = token
      payload.expiresIn = Date.now() + 300000; // 5 min

      User.findByIdAndUpdate(user._id, { $set: {payload} }, { new: true })
      .then(() => {
        return utilities.handleApiResponse(200, res, {message: 'An e-mail with OTP has been sent to ' + user.email + ' with further instructions.'});
      })
      .catch(() => {
        return utilities.handleApiResponse(500, res, new Error('Some error occured!'));
      })
  })
}

userAuth.resetPassword = (req, res) => {
  const { otp, email, password } = req.body;

  User.findOne({ 'payload.passwordToken': otp }, function(err, UserFound) {
    if (!UserFound) {
      return utilities.handleApiResponse(403, res, new Error('Invalid OTP'));
    } else {
      let currentTime = Date.now();
      let document = UserFound._doc || {};
      let { payload={} } = document;

      if (email != document.email) {
        return utilities.handleApiResponse(403, res, new Error('Reset email and the OTP doesn\'t match'));
      }

      UserFound.payload = {};
      if (parseInt(currentTime) <= parseInt(payload.expiresIn)) {
        UserFound.setPassword(password, () => {
          UserFound.save();
          return utilities.handleApiResponse(200, res, {message: 'The password reset was successful'});
        });
      } else {
        UserFound.save();
        return utilities.handleApiResponse(403, res, new Error('This OTP has expired'));
      }
    }
  });
}

userAuth.changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;

  User.findById(req.user._id, (err, user) => {
    if (err) {
      return utilities.handleApiResponse(400, res, new Error(err));
    } else {
      if (!user) {
        return utilities.handleApiResponse(400, res, new Error('User not found'));
      } else {
        user.changePassword(oldPassword, newPassword, function(err) {
           if(err) {
            if(err.name === 'IncorrectPasswordError'){
              return utilities.handleApiResponse(400, res, new Error('Incorrect password'));
            } else {
              return utilities.handleApiResponse(400, res, new Error('Something went wrong!! Please try again after sometime'));
            }
          } else {
            return utilities.handleApiResponse(200, res, {message: 'Your password has been changed successfully' });
           }
         });
      }
    }
  });
}