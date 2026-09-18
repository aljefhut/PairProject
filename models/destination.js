'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Destination extends Model {
    static associate(models) {
      Destination.belongsTo(models.Category, { foreignKey: 'CategoryId' });
      Destination.hasMany(models.Booking, { foreignKey: 'DestinationId' });
      Destination.belongsToMany(models.User, { through: models.Booking, foreignKey: 'DestinationId' });
    }

    // Static Method
    static getAffordable(maxPrice = 100000) {
      return Destination.findAll({
        where: { price: { [Op.lte]: maxPrice } },
        order: [['price', 'ASC']]
      });
    }

    // Getter Method
    get formattedPrice() {
      return `Rp ${this.price.toLocaleString('id-ID')}`;
    }
  }
  Destination.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Nama Destinasi wajib diisi' },
        notEmpty: { msg: 'Nama Destinasi tidak boleh kosong' }
      }
    },
    description: DataTypes.TEXT,
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Lokasi wajib diisi' },
        notEmpty: { msg: 'Lokasi tidak boleh kosong' }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Harga tiket wajib diisi' },
        min: { args: [10000], msg: 'Harga minimal Rp 10.000' }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: { msg: 'Format Image URL tidak valid' }
      }
    },
    CategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Destination',
  });
  return Destination;
};