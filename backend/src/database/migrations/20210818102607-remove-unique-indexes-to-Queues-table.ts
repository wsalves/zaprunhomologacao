import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeConstraint("Queues", "color"),
      queryInterface.removeConstraint("Queues", "name"),
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addConstraint("Queues", ["color"], {
        name: "color",
        type: 'unique'
      }),
      queryInterface.addConstraint("Queues", ["name"], {
        name: "name",
        type: 'unique'
      }),
    ]);
  }
};
