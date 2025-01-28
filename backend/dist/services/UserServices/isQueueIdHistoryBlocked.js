"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const isQueueIdHistoryBlocked = async ({ userRequest }) => {
    if (!userRequest) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    const user = await User_1.default.findByPk(userRequest);
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    return user.allHistoric === "enabled";
};
exports.default = isQueueIdHistoryBlocked;
