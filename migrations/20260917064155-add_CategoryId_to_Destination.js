'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Destinations", "CategoryId", {
      type: Sequelize.INTEGER
    })
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn("Destinations", "CategoryId");
  }
};
