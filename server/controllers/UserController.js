const { User, Room, UserRoom } = require('../models')

class UserController{
    static createOne(req, res){
        const { name } = req.body
        User.create({name})
        .then( user => {
            res.status(201).json({id: user.id, name: user.name})
        })
    }

    static createRoom(req, res){
        const { name, masterId } = req.body
        Room.create({name, masterId})
        .then( room => {
            res.status(201).json({id: room.id, name: room.name, masterId : room.masterId})
        })
    }

    static find(req, res){
        Room.findAll({include : {model: User}})
        .then( data => {
            res.status(200).json(data)
        })
    }

    static enterRoom(req, res){
        const { UserId, RoomId } = req.body
        UserRoom.create({UserId, RoomId})
        .then( () => {
            res.status(201).json({message: 'Success'})
        })
    }
}
module.exports = UserController 