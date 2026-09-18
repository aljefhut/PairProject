'use strict';
const fs = require("fs").promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = JSON.parse(await fs.readFile('./data/profiles.json', 'utf-8'))

    data = data.map(element => {
      return {
        fullName: element.fullName,
        phone: element.phone,
        address: element.address,
        UserId: element.UserId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    await queryInterface.bulkInsert("Profiles", data, {})
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Profiles', null, {});
  }
};
