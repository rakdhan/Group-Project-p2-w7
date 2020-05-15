'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Model = Sequelize.Model
  class UserRoom extends Model{}
  UserRoom.init({
    UserId: DataTypes.INTEGER,
    RoomId: DataTypes.INTEGER
  }, { sequelize });
  UserRoom.associate = function(models) {
    // associations can be defined here
  };
  return UserRoom;
};