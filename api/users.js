const passport = require('passport');
const fs = require('fs');
const path = require('path');
const { utilities, constants } = require('../utils');
const { User } = require('../models');

const userFields = [
    '_id', 'firstname', 'lastname', 'email', 'username', 'picture'
];
const validUpdatableFields = [
    'firstname', 'lastname', 'picture', 'about', 
    'phone', 'work', 'organization'
];
const imagesDir = constants.images;


const users = module.exports;

users.getUserById = async (req) => {
    let { id } = req.params;
    return await User.findById(id);
}

users.checkAuthentication = async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', {session: false}, function (err, user, info) {
            if (user) {
                resolve({authenticated: true});
            }
            resolve({authenticated: false});
        })(req, res, next);
    });
}

users.getUsersByUsername = async (req) => {
    const { page=0, limit=8, query } = req.query;
    let queryString = query.trim();

    let queryObj = {
        $regex: new RegExp(queryString),
        $options: '$i'
    };

    const keys = {
        $or: [{username: queryObj}, {firstname: queryObj}, {lastname: queryObj}],
    };

    const [users, count=0] = await Promise.all([
        User.find(keys, userFields).sort({ _id: -1 }).skip(page * limit).limit(limit),
        User.countDocuments(keys)
    ])

    return utilities.paginateResponse(users, count, limit, page);
}

users.updateUserData = async (req) => {
    const { user, body } = req;

    if (user && user._id) {
        const payload = {};

        validUpdatableFields.forEach((field) => {
            if (body[field]) {
                payload[field] = body[field];
            }
        });

        const { location } = body;

        if (location) {
            let locationData = {};
            ['country', 'region', 'city'].forEach((item) => {
                if (location[item]) {
                    locationData[item] = location[item];
                }
            });

            payload.location = locationData;
        }

        await User.findByIdAndUpdate(user._id, { $set: payload }, { new: true, useFindAndModify: false });

        return {updated: true};
    }
}

users.updateUserProfile = async (req) => {
    const {user, body} = req;
    const {picture} = body;

    var pictureDir = path.join(imagesDir, 'profiles');
    
    if (!fs.existsSync(pictureDir)){
        fs.mkdirSync(pictureDir, { recursive: true });
    }
    
    var imageBuffer = utilities.decodeBase64Image(picture);

    if (!utilities.isSupportedImageType(imageBuffer.type)) {
        throw new Error('Invalid image! Type not supported.');
    }

    var imageExtension = utilities.getImageFileExtension(imageBuffer.type);
    var fileName = utilities.generateFilename('profile-' + user._id) + imageExtension;
    var picturePath = path.join(pictureDir, fileName);
    var pictureUrl = imagesDir.replace('\\', '/') + '/profiles/' + fileName;

    pictureUrl = pictureUrl.replace('uploads', 'assets');


    fs.writeFileSync(picturePath, imageBuffer.data);

    await User.findByIdAndUpdate(user._id, { $set: {picture: pictureUrl} }, { new: true });

    return {message: 'Profile picture changed successfully', picture: pictureUrl};
}

users.removeUserProfilePicture = async (req) => {
    const {user} = req;
    await User.findByIdAndUpdate(user._id, { $set: {picture: ''} }, { new: true });

    return {message: 'Profile picture was removed successfully'};
}

users.getUserActivityStatus = async (req) => {
    const {user} = req;
    return await User.findOne({_id: user._id}, ['status', 'lastActive']);
}