const passport = require('passport');
const { utilities } = require('../utils');
const { User, OTP, Session } = require('../models');
const { authentication } = require('../middlewares');
const { generators, emailer } = require('../utils');

const config = require('../app.config');

const userAuth = module.exports;

const SIGN_UP = 'signup', 
    PASSWORD_RESET = 'password_reset',
    CHANGE_PASSWORD = 'change_password',
    CHANGE_EMAIL = 'change_email';

const validOtpActions = [SIGN_UP, PASSWORD_RESET, CHANGE_PASSWORD, CHANGE_EMAIL];

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

userAuth.registerUser = async (req, res) => {
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
    const [emailExists, usernameExists] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    if (emailExists) {
      throw new Error('An account with the supplied email id already exists');
    }

    if (usernameExists) {
      throw new Error('An account with the supplied username already exists');
    }

    const { firstName, lastName } = generators.generateRanzomizedName();
    const about = generators.generateRanzomizedAbout();

    return new Promise((resolve, reject) => {
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

userAuth.sendOTP =  async (req) => {
    const {action, email, newEmail} = req.body;
    if (!validOtpActions.includes(action)) {
      throw new Error( `Invalid action '${action}' for generating the OTP`);
    }
    
    const token = utilities.generateOtp(6);
    const expiryTime = (Date.now() + 300000); // 5 min

    const user = await User.findOne({ email });
    const payload = {
      otp: token, 
      email, 
      expiresIn: expiryTime,
      action,
    };

    if (action == SIGN_UP) {
      if (user) {
        throw new Error('An account with that email address already exists');
      }
    }

    if (!user) {
      throw new Error(`Account with email ${email} doesn't exist on our servers`);
    }

    await OTP.findOneAndUpdate({email}, {$set: payload}, {upsert: true, useFindAndModify: false});

    if (action == CHANGE_PASSWORD) {
      await User.findByIdAndUpdate(user._id, { $set: {payload: {
        passwordToken: token,
        expiresIn: expiryTime,
      }} }, { new: true });
    }

    if (action == CHANGE_EMAIL) {
      let newEmailCode = utilities.generateOtp(6);
      let chechForDuplicateEmail = await User.findOne({ email: newEmail });
      if (chechForDuplicateEmail) {
        throw new Error(`An Account with email ${email} already exists`);
      }
      await User.findByIdAndUpdate(user._id, { $set: {payload: {
        emailTokens: [{
          emailId: email,
          token,
        }, {
          emailId: newEmail,
          token: newEmailCode,
        }],
        expiresIn: expiryTime,
      }} }, { new: true, useFindAndModify: false });

      await Promise.all([
        emailer.sendEmail(email, action, {email, code: token}),
        emailer.sendEmail(newEmail, action, {email: newEmail, code: newEmailCode})
      ]);

      return {message: 'E-mail with verification codes has been sent to ' + [email, newEmail].join(' and ')};
    }

    console.log(payload);
    return {message: 'An e-mail with code has been sent to ' + email};
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

userAuth.changePassword = async (req) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new Error('User not found!');
  }

  try {
    await user.changePassword(oldPassword, newPassword);
  } catch (err) {
    if (err.name === 'IncorrectPasswordError') {
      throw new Error('Incorrect current password!');
    }
  }

  return {message: 'Your password was changed successfully'};

}

userAuth.changeEmail = async (req) => {
  const { oldEmail, newEmail, oldEmailCode, newEmailCode } = req.body;
  const {user} = req;
  const {emailTokens=[]} = user.payload || {};
  const currentTime = Date.now();
  let newEmailPayload = {};

  if (emailTokens.length < 2) {
    throw new Error('Verification code wasn\'t requested for this operation');
  }

  newEmailPayload = emailTokens.find(el => el.emailId && el.emailId == newEmail);
  if (!newEmailPayload) {
    throw new Error("Supplied 'new-emails' doesn't match, please re-try the process");
  }

  const codeObj = await OTP.findOne({email: oldEmail, action: CHANGE_EMAIL});
  const {expiresIn} = codeObj;

  if (user.email != oldEmail) {
    throw new Error('The supplied email id doesn\'t exists on our servers');
  }

  if (!codeObj) {
    throw new Error('Invalid code');
  }

  if (codeObj.email != oldEmail) {
    throw new Error('The supplied code isn\'t associated with the email ' + oldEmail);
  }

  if (currentTime > Number(expiresIn)) {
    throw new Error('The code has been expired, please request for new codes');
  }

  if (newEmailPayload.token != newEmailCode) {
    throw new Error('The code doesn\'t match with the one that was sent to ' + newEmail);
  }

  if (codeObj.otp != oldEmailCode) {
    throw new Error('The code doesn\'t match with the one that was sent to ' + oldEmail);
  }

  await Promise.all([
    User.findByIdAndUpdate(user._id, {$set: {email: newEmail, payload: null}}, {useFindAndModify: false}),
    OTP.findByIdAndUpdate(codeObj._id, {$set: {revoked: true}}, {useFindAndModify: false}),
  ]);

  return {message: 'Email changed succesfully!'};
}