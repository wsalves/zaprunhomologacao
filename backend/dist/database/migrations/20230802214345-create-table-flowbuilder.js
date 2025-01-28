"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("FlowBuilders", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            user_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            active: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true
            },
            flow: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("FlowBuilders");
    }
};
