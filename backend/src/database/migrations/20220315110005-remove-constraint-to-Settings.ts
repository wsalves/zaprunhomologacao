import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query('DELETE FROM Settings'),
      queryInterface.sequelize.query('ALTER TABLE Settings DROP PRIMARY KEY'),
      queryInterface.addColumn("Settings", "id", {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query('DELETE FROM Settings'),
      queryInterface.removeColumn("Settings", "id"),
      queryInterface.addConstraint("Settings", ["key"], {
        type: "primary key",
        name: "Settings_pkey"
      });
  }
};
