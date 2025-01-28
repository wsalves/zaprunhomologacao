"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Tag_1 = __importDefault(require("../../models/Tag"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ListService = async ({ companyId, searchParam, kanban = 0 }) => {
    let whereCondition = {};
    if (searchParam) {
        whereCondition = {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.like]: `%${searchParam}%` } },
                { color: { [sequelize_1.Op.like]: `%${searchParam}%` } }
            ]
        };
    }
    const tags = await Tag_1.default.findAll({
        where: { ...whereCondition, companyId, kanban },
        order: [["name", "ASC"]],
        include: [
            {
                model: Contact_1.default,
                as: "contacts"
            }
        ],
        attributes: {
            exclude: ["createdAt", "updatedAt"],
            include: [
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("contacts.id")), "contactsCount"]
            ]
        },
        group: [
            "Tag.id",
            "contacts.ContactTag.tagId",
            "contacts.ContactTag.contactId",
            "contacts.ContactTag.createdAt",
            "contacts.ContactTag.updatedAt",
            "contacts.id"
        ]
    });
    return tags;
};
exports.default = ListService;
