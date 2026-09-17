'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'UserId' });
      Booking.belongsTo(models.Destination, { foreignKey: 'DestinationId' });
    }
  }
  Booking.init({
    UserId: DataTypes.INTEGER,
    DestinationId: DataTypes.INTEGER,
    bookingDate: DataTypes.DATE,
    totalTicket: DataTypes.INTEGER,
    totalPrice: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};