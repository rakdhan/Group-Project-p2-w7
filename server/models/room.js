'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Model = Sequelize.Model
  class Room extends Model{}
  Room.init({
    name: DataTypes.STRING,
    masterId : DataTypes.INTEGER
  }, { sequelize });
  Room.associate = function(models) {
    Room.belongsToMany(models.User, {through: models.UserRoom})
  };
  return Room;
};