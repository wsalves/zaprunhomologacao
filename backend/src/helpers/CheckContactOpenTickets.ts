import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import User from "../models/User";
import Queue from "../models/Queue";

const CheckContactOpenTickets = async (contactId, whatsappId, companyId): Promise<Ticket> => {
  return await Ticket.findOne({
    where: { contactId, whatsappId, companyId, status: { [Op.or]: ["open", "pending"] } }
  });
};

export default CheckContactOpenTickets;
