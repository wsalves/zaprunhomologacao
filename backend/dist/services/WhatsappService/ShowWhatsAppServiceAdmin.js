"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const Prompt_1 = __importDefault(require("../../models/Prompt"));
const ShowWhatsAppServiceAdmin = async (id) => {
    const findOptions = {
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage", "integrationId", "fileListId", "closeTicket"],
                include: [
                    {
                        model: Chatbot_1.default,
                        as: "chatbots",
                        attributes: ["id", "name", "greetingMessage", "closeTicket"]
                    }
                ]
            },
            {
                model: Prompt_1.default,
                as: "prompt",
            }
        ],
        order: [
            ["queues", "orderQueue", "ASC"],
            ["queues", "chatbots", "id", "ASC"]
        ]
    };
    const whatsapp = await Whatsapp_1.default.findByPk(id, findOptions);
    if (!whatsapp) {
        throw new AppError_1.default("ERR_NO_WAPP_FOUND", 404);
    }
    return whatsapp;
};
exports.default = ShowWhatsAppServiceAdmin;
