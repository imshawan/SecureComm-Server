const passport = require('passport');
const { utilities } = require('../utils');
const { User, OTP, Session } = require('../models');
const { authentication } = require('../middlewares');
const { generators } = require('../utils');

const config = require('../app.config');

const userAuth = module.exports;

userAuth.get = (req) => {
    return new Promise((resolve, reject) => {
      User.find({}, (err, users) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(users);
        }
      })
    });
  }

userAuth.registerUser = (req, res) => {
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

    return new Promise((resolve, reject) => {
      const { firstName, lastName } = generators.generateRanzomizedName();
      const about = generators.generateRanzomizedAbout();

      User.register(new User({username}), password, (err, user) => {
        if (err){
          reject(err);
        } else {
            user.email = email;
            user.firstname = firstName;
            user.lastname = lastName;
            user.about = about;
            // user.acceptedTerms = req.body.acceptedTerms;
            user.save((err, user) => {
            if (err) {
              reject(err);
            }
            passport.authenticate('local')(req, res, () => {
              resolve({ message: 'You have successfully signed up!' });
            });
          });
        }
      });
    });
  }

userAuth.sendOTP = (req) => {
    return new Promise((resolve, reject) => {
      var token = utilities.generateOtp(6)
  
      User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            var payload = {}
            payload.otp = token;
            payload.email = req.body.email;
            payload.expiresIn = Date.now() + 300000; // 5 min
      
            OTP.create(payload).then(() => {
                resolve({message: 'An e-mail with OTP has been sent to ' + req.body.email + '.'})
            }).catch((err) => {
                reject(err.message);
            });
          }
          else {
            reject('An account with that email address already exists');
          }
        })
    });
  }

  userAuth.signIn = async (req) => {
    const {deviceId} = req.body;
    const token = authentication.getToken({_id: req.user._id}, req.body.remember_me);
    if (token) {
      const payload = {
        token, message: 'You have successfully logged in!'
      };
      const sessionPayload = {};

      let user = await User.findById({_id: req.user._id});
      if (!user) {
        throw new Error('User not found!');
      }

      payload.user = user && user._doc ? user._doc : {};
      if (payload.user.payload) {
        delete payload.user.payload;
      }

      let session = await Session.findOne({user: payload.user._id});
      if (session) {
        throw new Error('Cannot login into multiple devices at the same time');
      }

      sessionPayload.token = token;
      sessionPayload.user = payload.user._id;
      sessionPayload.deviceId = deviceId;

      await Session.findOneAndUpdate({user: sessionPayload.user}, sessionPayload, {upsert: true, useFindAndModify: false});

      return payload;

    }
  }

  userAuth.signOut = async (req) => {
    const {user} = req;

    let session = await Session.findOne({user: user._id});
    if (session) {
      await Session.findOneAndRemove({user: user._id}, {useFindAndModify: false});
    }

    return {message: 'Logged out successfully'};
  }

  userAuth.forgotPassword = (req) => {
    return new Promise((resolve, reject) => {
      let token = utilities.generateOtp(6);
  
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          reject('Account with that email address doesn\'t exists');
        }
        var payload = {}
        payload.passwordToken = token;
        payload.expiresIn = Date.now() + 300000; // 5 min

        User.findByIdAndUpdate(user._id, { $set: {payload} }, { new: true })
        .then(() => {
          resolve({message: 'An e-mail with OTP has been sent to ' + user.email + ' with further instructions.'});
        })
        .catch(() => {
          reject('Some error occured!');
        })
      });
    });
  }

userAuth.resetPassword = (req) => {
  const { otp, email, password } = req.body;

  return new Promise((resolve, reject) => {
    User.findOne({ 'payload.passwordToken': otp }, function(err, UserFound) {
      if (!UserFound) {
        reject('Invalid OTP');
      } else {
        let currentTime = Date.now();
        let document = UserFound._doc || {};
        let { payload={} } = document;
  
        if (email != document.email) {
          reject('Reset email and the OTP doesn\'t match');
        }
  
        UserFound.payload = {};
        if (parseInt(currentTime) <= parseInt(payload.expiresIn)) {
          UserFound.setPassword(password, () => {
            UserFound.save();
            resolve({message: 'The password reset was successful'});
          });
        } else {
          UserFound.save();
          reject('This OTP has expired');
        }
      }
    });
  });
}

userAuth.changePassword = (req) => {
  const { oldPassword, newPassword } = req.body;

  return new Promise((resolve, reject) => {
    User.findById(req.user._id, (err, user) => {
      if (err) {
        reject(err);
      } else {
        if (!user) {
          reject('User not found');
        } else {
          user.changePassword(oldPassword, newPassword, function(err) {
             if(err) {
              if(err.name === 'IncorrectPasswordError'){
                reject('Incorrect password');
              } else {
                reject('Something went wrong!! Please try again after sometime');
              }
            } else {
              resolve({message: 'Your password has been changed successfully' });
             }
           });
        }
      }
    });
  });
}