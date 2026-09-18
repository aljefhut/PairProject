'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, { foreignKey: 'UserId' });
      User.hasMany(models.Booking, { foreignKey: 'UserId' });
      User.belongsToMany(models.Destination, { through: models.Booking, foreignKey: 'UserId' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Email sudah terdaftar' },
      validate: {
        notNull: { msg: 'Email wajib diisi' },
        notEmpty: { msg: 'Email tidak boleh kosong' },
        isEmail: { msg: 'Format email tidak valid' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password wajib diisi' },
        notEmpty: { msg: 'Password tidak boleh kosong' },
        len: { args: [8, 100], msg: 'Password minimal 8 karakter' }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Role wajib diisi' },
        isIn: { args: [['Admin', 'Customer']], msg: 'Role harus Admin atau Customer' }
      }
    }
  }, {
    hooks: {
      beforeCreate(instance) {
        const salt = bcrypt.genSaltSync(10);
        instance.password = bcrypt.hashSync(instance.password, salt);
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};