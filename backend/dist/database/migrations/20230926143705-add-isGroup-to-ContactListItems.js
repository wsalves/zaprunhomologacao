"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("ContactListItems", "isGroup", {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("ContactListItems", "isGroup");
    }
};
