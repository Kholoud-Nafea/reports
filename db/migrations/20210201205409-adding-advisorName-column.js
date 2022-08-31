'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Projects', 'advisorName', {
      type: Sequelize.STRING,
      defaultValue: ""
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Projects',
      'advisorName'
    );
  }
};
