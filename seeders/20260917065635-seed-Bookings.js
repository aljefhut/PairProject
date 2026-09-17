'use strict';
const fs = require("fs").promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = JSON.parse(await fs.readFile('./data/bookings.json', 'utf-8'))

    data = data.map(element => {
      return {
        UserId: element.UserId,
        DestinationId: element.DestinationId,
        bookingDate: element.bookingDate,
        totalTicket: element.totalTicket,
        totalPrice: element.totalPrice,
        status: element.status,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    await queryInterface.bulkInsert("Bookings", data, {})
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Bookings', null, {});
  }
};
