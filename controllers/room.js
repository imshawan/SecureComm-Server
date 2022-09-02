const { utilities, incrementFieldCount } = require('../utils');
const { Room, User } = require('../models');


const room = module.exports;

room.create = async (req, res) => {
    const { user } = req;
    const { members, name, description } = req.body;

    if (members.length < 2) {
        return utilities.handleApiResponse(400, res, new Error('Atleast 2 members are required to create/join a room'))
    }
    let room = await Room.find({members: { $all: members }}).populate('creator');
    if (room.length) {
        if (Array.isArray(room)) {
            room = room[0];
        }
    } else {
        const roomId = await incrementFieldCount('roomId');
        let payload = {
            roomId,
            name,
            description,
            members,
            creator: user._id,
        }
        
        room = await Room.create(payload);
    }
    
    room = room._doc || room;
    let memberDetails = await Promise.all(room.members.map( async (elem) => {
        let userData = await User.findById(elem, ['firstname', 'lastname', 'username', 'picture']);
        return {[elem]: userData};
    }));

    utilities.handleApiResponse(200, res, {...room, memberDetails});
}