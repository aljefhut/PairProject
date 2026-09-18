'use strict';
const fs = require("fs").promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = JSON.parse(await fs.readFile('./data/destinations.json', 'utf-8'))

    data = data.map(element => {
      return {
        name: element.name,
        description: element.description,
        location: element.location,
        price: element.price,
        imageUrl: element.imageUrl,
        CategoryId: element.CategoryId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    await queryInterface.bulkInsert("Destinations", data, {})
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Destinations', null, {});
  }
};
