module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Messages', 'wid', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Messages', 'wid');
  }
};
