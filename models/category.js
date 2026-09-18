'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Destination, { foreignKey: 'CategoryId' });
    }
  }
  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Nama Kategori wajib diisi' },
        notEmpty: { msg: 'Nama Kategori tidak boleh kosong' }
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};