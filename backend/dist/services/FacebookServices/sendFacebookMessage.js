"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const graphAPI_1 = require("./graphAPI");
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const sendFacebookMessage = async ({ body, ticket, quotedMsg }) => {
    const { number } = ticket.contact;
    try {
        const send = await (0, graphAPI_1.sendText)(number, (0, Mustache_1.default)(body, ticket), ticket.whatsapp.facebookUserToken);
        await ticket.update({ lastMessage: body });
        return send;
    }
    catch (err) {
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
};
exports.default = sendFacebookMessage;
