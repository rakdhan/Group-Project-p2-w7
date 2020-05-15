'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Model = Sequelize.Model
  class User extends Model{}
  User.init({
    name: DataTypes.STRING
  }, { sequelize });
  User.associate = function(models) {
    User.belongsToMany(models.Room, {through: models.UserRoom})
  };
  return User;
};