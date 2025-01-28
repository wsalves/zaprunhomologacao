"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sayChatbot = exports.deleteAndCreateDialogStage = void 0;
const path_1 = __importDefault(require("path"));
const wbotMessageListener_1 = require("./wbotMessageListener");
const ShowDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/ShowDialogChatBotsServices"));
const ShowQueueService_1 = __importDefault(require("../QueueService/ShowQueueService"));
const ShowChatBotServices_1 = __importDefault(require("../ChatBotServices/ShowChatBotServices"));
const DeleteDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/DeleteDialogChatBotsServices"));
const ShowChatBotByChatbotIdServices_1 = __importDefault(require("../ChatBotServices/ShowChatBotByChatbotIdServices"));
const CreateDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/CreateDialogChatBotsServices"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const ShowService_1 = __importDefault(require("../FileServices/ShowService"));
const SendWhatsAppMedia_1 = __importStar(require("./SendWhatsAppMedia"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const fs = require('fs');
var axios = require('axios');
const isNumeric = (value) => /^-?\d+$/.test(value);
const deleteAndCreateDialogStage = async (contact, chatbotId, ticket) => {
    try {
        await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        const bots = await (0, ShowChatBotByChatbotIdServices_1.default)(chatbotId);
        if (!bots) {
            await ticket.update({ isBot: false });
        }
        return await (0, CreateDialogChatBotsServices_1.default)({
            awaiting: 1,
            contactId: contact.id,
            chatbotId,
            queueId: bots.queueId
        });
    }
    catch (error) {
        await ticket.update({ isBot: false });
    }
};
exports.deleteAndCreateDialogStage = deleteAndCreateDialogStage;
const sendMessage = async (wbot, contact, ticket, body) => {
    const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
        text: (0, Mustache_1.default)(body, ticket)
    });
    await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, contact);
};
const sendMessageLink = async (wbot, contact, ticket, url, caption) => {
    let sentMessage;
    try {
        sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            document: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
            fileName: caption,
            mimetype: 'application/pdf'
        });
    }
    catch (error) {
        sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            text: (0, Mustache_1.default)('\u200eNão consegui enviar o PDF, tente novamente!', ticket)
        });
    }
    await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, contact);
};
const sendMessageImage = async (wbot, contact, ticket, url, caption) => {
    let sentMessage;
    try {
        sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            image: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
            fileName: caption,
            caption: caption,
            mimetype: 'image/jpeg'
        });
    }
    catch (error) {
        sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            text: (0, Mustache_1.default)('Não consegui enviar o PDF, tente novamente!', ticket)
        });
    }
    await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, contact);
};
// const sendDialog = async (
//   choosenQueue: Chatbot,
//   wbot: Session,
//   contact: Contact,
//   ticket: Ticket
// ) => {
//   const showChatBots = await ShowChatBotServices(choosenQueue.id);
//   if (showChatBots.options) {
//     const buttonActive = await Setting.findOne({
//       where: {
//         key: "chatBotType",
//         companyId: ticket.companyId
//       }
//     });
//     const typeBot = buttonActive?.value || "text";
//     const botText = async () => {
//       let options = "";
//       showChatBots.options.forEach((option, index) => {
//         options += `*${index + 1}* - ${option.name}\n`;
//       });
//       const optionsBack =
//         options.length > 0
//           ? `${options}\n*#* Voltar para o menu principal`
//           : options;
//       if (options.length > 0) {
//         const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
//         const sendOption = await sendMessage(wbot, contact, ticket, body);
//         return sendOption;
//       }
//       const body = `\u200e${choosenQueue.greetingMessage}`;
//       const send = await sendMessage(wbot, contact, ticket, body);
//       return send;
//     };
//     const botButton = async () => {
//       const buttons = [];
//       showChatBots.options.forEach((option, index) => {
//         buttons.push({
//           buttonId: `${index + 1}`,
//           buttonText: { displayText: option.name },
//           type: 1
//         });
//       });
//       if (buttons.length > 0) {
//         const buttonMessage = {
//           text: `\u200e${choosenQueue.greetingMessage}`,
//           buttons,
//           headerType: 1
//         };
//         // const send = await wbot.sendMessage(
//         //   `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
//         //   buttonMessage
//         // );
//         await wbot.presenceSubscribe(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1500)
//         await wbot.sendPresenceUpdate('composing', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1000)
//         await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         const send = await wbot.sendMessage(
//           `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
//           buttonMessage
//         );
//         await verifyMessage(send, ticket, contact);
//         return send;
//       }
//       const body = `\u200e${choosenQueue.greetingMessage}`;
//       const send = await sendMessage(wbot, contact, ticket, body);
//       return send;
//     };
//     const botList = async () => {
//       const sectionsRows = [];
//       showChatBots.options.forEach((queue, index) => {
//         sectionsRows.push({
//           title: queue.name,
//           rowId: `${index + 1}`
//         });
//       });
//       if (sectionsRows.length > 0) {
//         const sections = [
//           {
//             title: "Menu",
//             rows: sectionsRows
//           }
//         ];
//         const listMessage = {
//           text: formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket),
//           buttonText: "Escolha uma opção",
//           sections
//         };
//         await wbot.presenceSubscribe(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1500)
//         await wbot.sendPresenceUpdate('composing', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1000)
//         await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         const sendMsg = await wbot.sendMessage(
//           `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
//           listMessage
//         );
//         await verifyMessage(sendMsg, ticket, contact);
//         return sendMsg;
//       }
//       const body = `\u200e${choosenQueue.greetingMessage}`;
//       const send = await sendMessage(wbot, contact, ticket, body);
//       return send;
//     };
//     if (typeBot === "text") {
//       return botText();
//     }
//     if (typeBot === "button" && showChatBots.options.length > 3) {
//       return botText();
//     }
//     if (typeBot === "button" && showChatBots.options.length <= 3) {
//       return botButton();
//     }
//     if (typeBot === "list") {
//       return botList();
//     }
//   }
// };
const sendDialog = async (choosenQueue, wbot, contact, ticket) => {
    const showChatBots = await (0, ShowChatBotServices_1.default)(choosenQueue.id);
    if (showChatBots.options) {
        let companyId = ticket.companyId;
        const buttonActive = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        const typeBot = buttonActive?.chatBotType || "text";
        const botText = async () => {
            let options = "";
            showChatBots.options.forEach((option, index) => {
                options += `*[ ${index + 1} ]* - ${option.name}\n`;
            });
            const optionsBack = options.length > 0
                ? `${options}\n*[ # ]* Voltar para o menu principal\n*[ Sair ]* Encerrar atendimento`
                : `${options}\n*[ Sair ]* Encerrar atendimento`;
            if (options.length > 0) {
                const body = (0, Mustache_1.default)(`\u200e ${choosenQueue.greetingMessage}\n\n${optionsBack}`, ticket);
                const sendOption = await sendMessage(wbot, contact, ticket, body);
                return sendOption;
            }
            const body = (0, Mustache_1.default)(`\u200e ${choosenQueue.greetingMessage}`, ticket);
            const send = await sendMessage(wbot, contact, ticket, body);
            // if (choosenQueue.closeTicket) {
            //   await sendMsgAndCloseTicket(wbot, ticket.contact, ticket);
            // }
            return send;
        };
        const botButton = async () => {
            const buttons = [];
            showChatBots.options.forEach((option, index) => {
                buttons.push({
                    buttonId: `${index + 1}`,
                    buttonText: { displayText: option.name },
                    type: 1
                });
            });
            if (buttons.length > 0) {
                const buttonMessage = {
                    text: `\u200e${choosenQueue.greetingMessage}`,
                    buttons,
                    headerType: 1
                };
                const send = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, buttonMessage);
                await (0, wbotMessageListener_1.verifyMessage)(send, ticket, contact);
                return send;
            }
            const body = `\u200e${choosenQueue.greetingMessage}`;
            const send = await sendMessage(wbot, contact, ticket, body);
            return send;
        };
        const botList = async () => {
            const sectionsRows = [];
            showChatBots.options.forEach((queue, index) => {
                sectionsRows.push({
                    title: queue.name,
                    rowId: `${index + 1}`
                });
            });
            if (sectionsRows.length > 0) {
                const sections = [
                    {
                        title: "Menu",
                        rows: sectionsRows
                    }
                ];
                const listMessage = {
                    text: (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, ticket),
                    buttonText: "Escolha uma opção",
                    sections
                };
                const sendMsg = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
                await (0, wbotMessageListener_1.verifyMessage)(sendMsg, ticket, contact);
                return sendMsg;
            }
            const body = `\u200e${choosenQueue.greetingMessage}`;
            const send = await sendMessage(wbot, contact, ticket, body);
            return send;
        };
        if (typeBot === "text") {
            return await botText();
        }
        if (typeBot === "button" && showChatBots.options.length > 4) {
            return await botText();
        }
        if (typeBot === "button" && showChatBots.options.length <= 4) {
            return await botButton();
        }
        if (typeBot === "list") {
            return await botList();
        }
    }
};
const backToMainMenu = async (wbot, contact, ticket, ticketTraking) => {
    await (0, UpdateTicketService_1.default)({
        ticketData: { queueId: null, userId: null },
        ticketId: ticket.id,
        companyId: ticket.companyId
    });
    // console.log("GETTING WHATSAPP BACK TO MAIN MENU", ticket.whatsappId, wbot.id)
    const { queues, greetingMessage, greetingMediaAttachment } = await (0, ShowWhatsAppService_1.default)(wbot.id, ticket.companyId);
    const buttonActive = await CompaniesSettings_1.default.findOne({
        where: {
            companyId: ticket.companyId
        }
    });
    const botText = async () => {
        let options = "";
        queues.forEach((option, index) => {
            options += `*[ ${index + 1} ]* - ${option.name}\n`;
        });
        options += `\n*[ Sair ]* - Encerrar Atendimento`;
        const body = (0, Mustache_1.default)(`\u200e ${greetingMessage}\n\n${options}`, ticket);
        if (greetingMediaAttachment !== null) {
            const filePath = path_1.default.resolve("public", `company${ticket.companyId}`, ticket.whatsapp.greetingMediaAttachment);
            const messagePath = ticket.whatsapp.greetingMediaAttachment;
            const optionsMsg = await (0, SendWhatsAppMedia_1.getMessageOptions)(messagePath, filePath, String(ticket.companyId), body);
            const sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });
            await (0, wbotMessageListener_1.verifyMediaMessage)(sentMessage, ticket, contact, ticketTraking, false, false, wbot);
        }
        else {
            const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                text: body
            });
            await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, contact);
        }
        const deleteDialog = await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        return deleteDialog;
    };
    if (buttonActive.chatBotType === "text") {
        return botText();
    }
};
function validaCpfCnpj(val) {
    if (val.length == 11) {
        var cpf = val.trim();
        cpf = cpf.replace(/\./g, '');
        cpf = cpf.replace('-', '');
        cpf = cpf.split('');
        var v1 = 0;
        var v2 = 0;
        var aux = false;
        for (var i = 1; cpf.length > i; i++) {
            if (cpf[i - 1] != cpf[i]) {
                aux = true;
            }
        }
        if (aux == false) {
            return false;
        }
        for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
            v1 += cpf[i] * p;
        }
        v1 = ((v1 * 10) % 11);
        if (v1 == 10) {
            v1 = 0;
        }
        if (v1 != cpf[9]) {
            return false;
        }
        for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
            v2 += cpf[i] * p;
        }
        v2 = ((v2 * 10) % 11);
        if (v2 == 10) {
            v2 = 0;
        }
        if (v2 != cpf[10]) {
            return false;
        }
        else {
            return true;
        }
    }
    else if (val.length == 14) {
        var cnpj = val.trim();
        cnpj = cnpj.replace(/\./g, '');
        cnpj = cnpj.replace('-', '');
        cnpj = cnpj.replace('/', '');
        cnpj = cnpj.split('');
        var v1 = 0;
        var v2 = 0;
        var aux = false;
        for (var i = 1; cnpj.length > i; i++) {
            if (cnpj[i - 1] != cnpj[i]) {
                aux = true;
            }
        }
        if (aux == false) {
            return false;
        }
        for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
            if (p1 >= 2) {
                v1 += cnpj[i] * p1;
            }
            else {
                v1 += cnpj[i] * p2;
            }
        }
        v1 = (v1 % 11);
        if (v1 < 2) {
            v1 = 0;
        }
        else {
            v1 = (11 - v1);
        }
        if (v1 != cnpj[12]) {
            return false;
        }
        for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) {
            if (p1 >= 2) {
                v2 += cnpj[i] * p1;
            }
            else {
                v2 += cnpj[i] * p2;
            }
        }
        v2 = (v2 % 11);
        if (v2 < 2) {
            v2 = 0;
        }
        else {
            v2 = (11 - v2);
        }
        if (v2 != cnpj[13]) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep(time) {
    await timeout(time);
}
function firstDayOfMonth(month) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - month, 1);
    return firstDay;
}
;
function lastDayOfMonth(month) {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + month, 0);
    return lastDay;
}
;
function dataAtualFormatada(data) {
    var dia = data.getDate().toString(), diaF = (dia.length == 1) ? '0' + dia : dia, mes = (data.getMonth() + 1).toString(), mesF = (mes.length == 1) ? '0' + mes : mes, anoF = data.getFullYear();
    return diaF + "/" + mesF + "/" + anoF;
}
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function formatDate(date) {
    return date.substring(8, 10) + '/' + date.substring(5, 7) + '/' + date.substring(0, 4);
}
function sortfunction(a, b) {
    return a.dueDate.localeCompare(b.dueDate);
}
async function sendMsgAndCloseTicket(wbot, contact, ticket) {
    // const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // await sleep(2000)
    // await sendMessage(wbot, contact, ticket, bodyfinaliza);
    const ticketUpdateAgent = {
        ticketData: {
            status: "closed",
            userId: ticket?.userId || null,
            sendFarewellMessage: false,
            amountUsedBotQueues: 0
        },
        ticketId: ticket.id,
        companyId: ticket.companyId,
    };
    await sleep(2000);
    await (0, UpdateTicketService_1.default)(ticketUpdateAgent);
}
const sayChatbot = async (queueId, wbot, ticket, contact, msg, ticketTraking) => {
    // console.log("LINHA 718")
    // const selectedOption =
    //   msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    //   msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    //   getBodyMessage(msg);
    const selectedOption = msg?.message?.buttonsResponseMessage?.selectedButtonId ||
        msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
        (0, wbotMessageListener_1.getBodyMessage)(msg);
    if (!queueId && selectedOption && msg.key.fromMe)
        return;
    const getStageBot = await (0, ShowDialogChatBotsServices_1.default)(contact.id);
    // console.log(queues)
    // let enabledIntegrationActive: any
    // if (
    //   queues.name.toLocaleLowerCase().match(/^.*Financeiro$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*Boleto$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*Boletos$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2º via$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2ª via$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2° via$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2ª via de boletos$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2º via de boletos$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2° via de boletos$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2ª via de boleto$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2º via de boleto$/) ||
    //   queues.name.toLocaleLowerCase().match(/^.*2° via de boleto$/)
    // ) {
    //   let cpfcnpj
    //   cpfcnpj = selectedOption;
    //   cpfcnpj = cpfcnpj.replace(/\./g, '');
    //   cpfcnpj = cpfcnpj.replace('-', '')
    //   cpfcnpj = cpfcnpj.replace('/', '')
    //   cpfcnpj = cpfcnpj.replace(' ', '')
    //   cpfcnpj = cpfcnpj.replace(',', '')
    //   const numberCPFCNPJ = cpfcnpj
    //   //variaveis para a integração
    //   // MIKWEB
    //   let mikwebActive: any
    //   let mikwebToken: any
    //   let mikwebFoneContact: any
    //   let mikwebInitialCurrentMonth: any
    //   let mikwebFinalCurrentMonth: any
    //   // ASAAS
    //   let asaasActive: any
    //   let asaasToken: any
    // //   const enabledIntegration: any = await CheckIntegrations("enabledIntegration", ticket.companyId);
    // //   enabledIntegrationActive = enabledIntegration.isActive
    // //   if (enabledIntegrationActive) {
    // //     const mikweb: any = await CheckIntegrations("mikweb", ticket.companyId);
    // //     mikwebActive = mikweb.isActive
    // //     mikwebToken = mikweb.token
    // //     mikwebFoneContact = mikweb.foneContact
    // //     mikwebInitialCurrentMonth = mikweb.initialCurrentMonth
    // //     mikwebFinalCurrentMonth = mikweb.finalCurrentMonth
    // //     const asaas: any = await CheckIntegrations("asaas", ticket.companyId);
    // //     asaasActive = asaas.isActive
    // //     asaasToken = asaas.token
    // //     if (cpfcnpj.length === 11 || cpfcnpj.length === 14) {
    // //       const isCPFCNPJ = validaCpfCnpj(numberCPFCNPJ)
    // //       if (isCPFCNPJ) {
    // //         if (mikwebActive) {
    // //           const body = `*Assistente Virtual:*\nAguarde! Estamos consultando na base de dados!`;
    // //           try {
    // //             await sleep(2000)
    // //             await sendMessage(wbot, contact, ticket, body);
    // //           } catch (error) {
    // //             console.log('Não consegui enviar a mensagem!')
    // //           }
    // //           var data = JSON.stringify({});
    // //           var config = {
    // //             method: 'GET',
    // //             url: `https://api.mikweb.com.br/v1/admin/customers?search=${numberCPFCNPJ}`,
    // //             headers: {
    // //               'Content-Type': 'application/json',
    // //               'Authorization': `Bearer ${mikwebToken}`
    // //             },
    // //             data: data
    // //           };
    // //           axios(config)
    // //             .then(async function (response) {
    // //               // console.log('response.data.customers[0]', response.data.customers[0])
    // //               let clientId
    // //               let full_name
    // //               let zip_code
    // //               let street
    // //               let number
    // //               let neighborhood
    // //               let state
    // //               let city
    // //               let complement
    // //               let status
    // //               let planName
    // //               let planValue
    // //               let customer_group
    // //               clientId = response.data.customers[0].id;
    // //               full_name = response.data.customers[0].full_name;
    // //               zip_code = response.data.customers[0].zip_code;
    // //               street = response.data.customers[0].street;
    // //               number = response.data.customers[0].number;
    // //               neighborhood = response.data.customers[0].neighborhood;
    // //               state = response.data.customers[0].state;
    // //               city = response.data.customers[0].city;
    // //               complement = response.data.customers[0].complement;
    // //               status = response.data.customers[0].status;
    // //               planName = response.data.customers[0].plan.name;
    // //               planValue = response.data.customers[0].plan.value;
    // //               customer_group = response.data.customers[0].customer_group.name;
    // //               if (status === 'Ativo') {
    // //                 let dataVencimentoInicial
    // //                 let dataVencimentoFinal
    // //                 const dateInitial = `${dataAtualFormatada(firstDayOfMonth(mikwebInitialCurrentMonth))}`
    // //                 const dateFinal = `${dataAtualFormatada(lastDayOfMonth(mikwebFinalCurrentMonth))}`
    // //                 dataVencimentoInicial = replaceAll(dateInitial, '/', '-')
    // //                 dataVencimentoFinal = replaceAll(dateFinal, '/', '-')
    // //                 // verifica primeiro registros em abertos
    // //                 var config1 = {
    // //                   method: 'GET',
    // //                   url: `https://api.mikweb.com.br/v1/admin/billings?customer_id=${clientId}&situation_id=2`,
    // //                   headers: {
    // //                     'Authorization': `Bearer ${mikwebToken}`
    // //                   }
    // //                 };
    // //                 axios(config1)
    // //                   .then(async function (response) {
    // //                     // console.log('response.data.billings', response.data.billings)
    // //                     let qtd = response.data.billings.length;
    // //                     // console.log('qtd', qtd)
    // //                     for (var i = 0; i < qtd; i++) {
    // //                       let boletoValue
    // //                       let boletoValuePaid
    // //                       let boletoDatePayment
    // //                       let boletoSituation
    // //                       let boletoReference
    // //                       let boletoDueDay
    // //                       let boletoSituationName
    // //                       let boletoIntegrationLink
    // //                       let boletoDigitableLine
    // //                       boletoValue = response.data.billings[i].value;
    // //                       boletoValuePaid = response.data.billings[i].value_paid;
    // //                       boletoDatePayment = response.data.billings[i].date_payment;
    // //                       boletoSituation = response.data.billings[i].situation_id;
    // //                       boletoReference = response.data.billings[i].reference;
    // //                       boletoDueDay = response.data.billings[i].due_day;
    // //                       boletoSituationName = response.data.billings[i].situation_name;
    // //                       boletoIntegrationLink = response.data.billings[i].integration_link;
    // //                       boletoDigitableLine = response.data.billings[i].digitable_line;
    // //                       if (boletoSituation === 1 || boletoSituation === 2 || boletoSituation === 4) {
    // //                         if (boletoDatePayment === null) {
    // //                           try {
    // //                             const linhaDigitavel = boletoDigitableLine === null ? '' : '\n\nSegue abaixo a linha digitavel:'
    // //                             const bodyBoleto = `Nome: *${full_name.trim()}*\nDescrição: *${boletoReference}*\nData Vencimento: *${formatDate(boletoDueDay)}*\nValor Boleto: *${boletoValue}*\nLink do Boleto: ${boletoIntegrationLink}${linhaDigitavel}`
    // //                             await sleep(2000)
    // //                             await sendMessage(wbot, contact, ticket, bodyBoleto);
    // //                             if (boletoDigitableLine !== null) {
    // //                               try {
    // //                                 await sleep(1000)
    // //                                 await sendMessage(wbot, contact, ticket, boletoDigitableLine);
    // //                               } catch (error) {
    // //                                 console.log('Não consegui enviar a mensagem!')
    // //                               }
    // //                             }
    // //                           } catch (err) { }
    // //                           if (boletoIntegrationLink !== null && boletoDatePayment === null) {
    // //                             try {
    // //                               await sendMessage(wbot, contact, ticket, 'Segue abaixo o Boleto em PDF:');
    // //                               try {
    // //                                 const nomePDF = `${boletoDueDay.replaceAll('/', '-')}-${full_name.trim()}.pdf`
    // //                                 await sendMessageLink(wbot, contact, ticket, boletoIntegrationLink, nomePDF)
    // //                               } catch (error) {
    // //                                 await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
    // //                               }
    // //                             } catch (error) {
    // //                               await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
    // //                             }
    // //                           }
    // //                         }
    // //                       } else if (boletoSituation === 3 && boletoDatePayment !== null) {
    // //                         try {
    // //                           const bodyBoleto = `*Assistente Virtual:*\nNão foi localizado nenhum boleto em aberto no mês vigente.\n\nSe deseja receber o boleto do próximo mês, aguarde um de nossos atendentes.`
    // //                           await sleep(2000)
    // //                           await sendMessage(wbot, contact, ticket, bodyBoleto);
    // //                         } catch (error) {
    // //                           console.log('Não consegui enviar a mensagem!')
    // //                         }
    // //                       }
    // //                     }
    // //                   })
    // //                   .catch(function (error) {
    // //                     console.log(error);
    // //                   });
    // //               }
    // //               else if (status === 'Desativado') {
    // //                 try {
    // //                   const bodyBoleto = `*Assistente Virtual:*\nSua situação encontra-se em *Inadimplência*\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
    // //                   await sleep(2000)
    // //                   await sendMessage(wbot, contact, ticket, bodyBoleto);
    // //                 } catch (error) {
    // //                   console.log('Não consegui enviar a mensagem!')
    // //                 }
    // //               }
    // //             })
    // //             .catch(async function (error) {
    // //               console.log('error3', error.response.data)
    // //               try {
    // //                 const bodyBoleto = `*Assistente Virtual:*\nNão foi localizado nenhum boleto em aberto para você.\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
    // //                 await sleep(2000)
    // //                 await sendMessage(wbot, contact, ticket, bodyBoleto);
    // //               } catch (error) {
    // //                 console.log('Não consegui enviar a mensagem!')
    // //               }
    // //             })
    // //         }
    // //         if (asaasActive) {
    // //           if (isNumeric(numberCPFCNPJ) === true) {
    // //             if (cpfcnpj.length > 2) {
    // //               const isCPFCNPJ = validaCpfCnpj(numberCPFCNPJ)
    // //               if (isCPFCNPJ) {
    // //                 const body = `Aguarde! Estamos consultando na base de dados!`;
    // //                 try {
    // //                   await sleep(2000)
    // //                   await sendMessage(wbot, contact, ticket, body);
    // //                 } catch (error) { }
    // //                 var optionsc = {
    // //                   method: 'GET',
    // //                   url: 'https://www.asaas.com/api/v3/customers',
    // //                   params: { cpfCnpj: numberCPFCNPJ },
    // //                   headers: {
    // //                     'Content-Type': 'application/json',
    // //                     access_token: asaasToken
    // //                   }
    // //                 };
    // //                 axios.request(optionsc).then(async function (response) {
    // //                   let nome;
    // //                   let id_cliente;
    // //                   let totalCount;
    // //                   nome = response?.data?.data[0]?.name;
    // //                   id_cliente = response?.data?.data[0]?.id;
    // //                   totalCount = response?.data?.totalCount;
    // //                   if (totalCount === 0) {
    // //                     const body = `Cadastro não localizado! *CPF/CNPJ* incorreto ou inválido. Tenta novamente!`;
    // //                     await sleep(2000)
    // //                     await sendMessage(wbot, contact, ticket, body);
    // //                   } else {
    // //                     const body = `Localizei seu Cadastro! \n*${nome}* só mais um instante por favor!`;
    // //                     await sleep(2000)
    // //                     await sendMessage(wbot, contact, ticket, body);
    // //                     var optionsListpaymentOVERDUE = {
    // //                       method: 'GET',
    // //                       url: 'https://www.asaas.com/api/v3/payments',
    // //                       params: { customer: id_cliente, status: 'OVERDUE' },
    // //                       headers: {
    // //                         'Content-Type': 'application/json',
    // //                         access_token: asaasToken
    // //                       }
    // //                     };
    // //                     axios.request(optionsListpaymentOVERDUE).then(async function (response) {
    // //                       let totalCount_overdue;
    // //                       totalCount_overdue = response?.data?.totalCount;
    // //                       if (totalCount_overdue === 0) {
    // //                         const body = `Você não tem nenhuma fatura vencida! \nVou te enviar a proxima fatura. Por favor aguarde!`;
    // //                         await sleep(2000)
    // //                         await sendMessage(wbot, contact, ticket, body);
    // //                         var optionsPENDING = {
    // //                           method: 'GET',
    // //                           url: 'https://www.asaas.com/api/v3/payments',
    // //                           params: { customer: id_cliente, status: 'PENDING' },
    // //                           headers: {
    // //                             'Content-Type': 'application/json',
    // //                             access_token: asaasToken
    // //                           }
    // //                         };
    // //                         axios.request(optionsPENDING).then(async function (response) {
    // //                           const ordenado = response?.data?.data.sort(sortfunction);
    // //                           let id_payment_pending;
    // //                           let value_pending;
    // //                           let description_pending;
    // //                           let invoiceUrl_pending;
    // //                           let dueDate_pending;
    // //                           let invoiceNumber_pending;
    // //                           let totalCount_pending;
    // //                           let value_pending_corrigida;
    // //                           let dueDate_pending_corrigida;
    // //                           let bankSlipUrl;
    // //                           id_payment_pending = ordenado[0]?.id;
    // //                           value_pending = ordenado[0]?.value;
    // //                           description_pending = ordenado[0]?.description;
    // //                           invoiceUrl_pending = ordenado[0]?.invoiceUrl;
    // //                           dueDate_pending = ordenado[0]?.dueDate;
    // //                           invoiceNumber_pending = ordenado[0]?.invoiceNumber;
    // //                           totalCount_pending = response?.data?.totalCount;
    // //                           bankSlipUrl = response?.data?.data[0]?.bankSlipUrl;
    // //                           dueDate_pending_corrigida = dueDate_pending?.split('-')?.reverse()?.join('/');
    // //                           value_pending_corrigida = value_pending.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    // //                           const bodyBoleto = `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${invoiceNumber_pending}\n*Nome:* ${nome}\n*Valor:* R$ ${value_pending_corrigida}\n*Data Vencimento:* ${dueDate_pending_corrigida}\n*Descrição:* ${description_pending}\n*Link:* ${invoiceUrl_pending}`
    // //                           await sleep(2000)
    // //                           await sendMessage(wbot, contact, ticket, bodyBoleto);
    // //                           //GET DADOS PIX
    // //                           var optionsGetPIX = {
    // //                             method: 'GET',
    // //                             url: `https://www.asaas.com/api/v3/payments/${id_payment_pending}/pixQrCode`,
    // //                             headers: {
    // //                               'Content-Type': 'application/json',
    // //                               access_token: asaasToken
    // //                             }
    // //                           };
    // //                           axios.request(optionsGetPIX).then(async function (response) {
    // //                             let success;
    // //                             let payload;
    // //                             success = response?.data?.success;
    // //                             payload = response?.data?.payload;
    // //                             if (success === true) {
    // //                               const bodyPixCP = `Este é o *PIX Copia e Cola*`;
    // //                               await sleep(2000)
    // //                               await sendMessage(wbot, contact, ticket, bodyPixCP);
    // //                               await sleep(2000)
    // //                               await sendMessage(wbot, contact, ticket, payload);
    // //                               let linkBoleto = `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=L|0&chl=${payload}`
    // //                               const nomePDF = ``
    // //                               await sleep(2000)
    // //                               await sendMessageImage(wbot, contact, ticket, linkBoleto, nomePDF)
    // //                               var optionsBoletopend = {
    // //                                 method: 'GET',
    // //                                 url: `https://www.asaas.com/api/v3/payments/${id_payment_pending}/identificationField`,
    // //                                 headers: {
    // //                                   'Content-Type': 'application/json',
    // //                                   access_token: asaasToken
    // //                                 }
    // //                               };
    // //                               axios.request(optionsBoletopend).then(async function (response) {
    // //                                 let codigo_barras
    // //                                 codigo_barras = response.data.identificationField;
    // //                                 if (bankSlipUrl?.length > 10) {
    // //                                   const body = `Este é o *PDF do boleto*!`;
    // //                                   await sleep(2000)
    // //                                   await sendMessage(wbot, contact, ticket, body);
    // //                                   const nomePDF = `${invoiceNumber_pending}-${dueDate_pending_corrigida.replaceAll('/', '-')}.pdf`
    // //                                   await sleep(2000)
    // //                                   await sendMessageLink(wbot, contact, ticket, bankSlipUrl, nomePDF)
    // //                                 }
    // //                                 if (response.data?.errors !== 'invalid_action') {
    // //                                   const bodycodigo = `Este é o *Código de Barras*!`;
    // //                                   await sleep(2000)
    // //                                   await sendMessage(wbot, contact, ticket, bodycodigo);
    // //                                   await sleep(2000)
    // //                                   await sendMessage(wbot, contact, ticket, codigo_barras);
    // //                                   const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // //                                   await sleep(2000)
    // //                                   await sendMessage(wbot, contact, ticket, bodyfinaliza);
    // //                                   const ticketUpdateAgent = {
    // //                                     ticketData: {
    // //                                       status: "closed",
    // //                                       userId: 1,
    // //                                       sendFarewellMessage: false,
    // //                                       amountUsedBotQueues: 0
    // //                                     },
    // //                                     ticketId: ticket.id,
    // //                                     companyId: ticket.companyId,
    // //                                     ratingId: undefined
    // //                                   };
    // //                                   await sleep(2000)
    // //                                   await UpdateTicketService(ticketUpdateAgent);
    // //                                 } else {
    // //                                   const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // //                                   await sleep(2000)
    // //                                   await sendMessage(wbot, contact, ticket, bodyfinaliza);
    // //                                   const ticketUpdateAgent = {
    // //                                     ticketData: {
    // //                                       status: "closed",
    // //                                       userId: 1,
    // //                                       sendFarewellMessage: false,
    // //                                       amountUsedBotQueues: 0
    // //                                     },
    // //                                     ticketId: ticket.id,
    // //                                     companyId: ticket.companyId,
    // //                                     ratingId: undefined
    // //                                   };
    // //                                   await sleep(2000)
    // //                                   await UpdateTicketService(ticketUpdateAgent);
    // //                                 }
    // //                               }).catch(async function (error) {
    // //                                 const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // //                                 await sleep(2000)
    // //                                 await sendMessage(wbot, contact, ticket, bodyfinaliza);
    // //                                 const ticketUpdateAgent = {
    // //                                   ticketData: {
    // //                                     status: "closed",
    // //                                     userId: 1,
    // //                                     sendFarewellMessage: false,
    // //                                     amountUsedBotQueues: 0
    // //                                   },
    // //                                   ticketId: ticket.id,
    // //                                   companyId: ticket.companyId,
    // //                                   ratingId: undefined
    // //                                 };
    // //                                 await sleep(2000)
    // //                                 await UpdateTicketService(ticketUpdateAgent);
    // //                               });
    // //                             }
    // //                           }).catch(async function (error) {
    // //                             const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
    // //                             await sleep(2000)
    // //                             await sendMessage(wbot, contact, ticket, body);
    // //                           });
    // //                           /*
    // //                           const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // //                           await sleep(2000)
    // //                           await sendMessage(wbot, contact, ticket, bodyfinaliza);
    // //                             const ticketUpdateAgent = {
    // //                               ticketData: {
    // //                                 status: "closed",
    // //                                 userId: 1,
    // //                                 sendFarewellMessage: false,
    // //                                 amountUsedBotQueues: 0
    // //                               },
    // //                               ticketId: ticket.id,
    // //                               ratingId: undefined
    // //                             };
    // //                             await sleep(2000)
    // //                             await UpdateTicketService(ticketUpdateAgent);
    // //                           */
    // //                         }).catch(async function (error) {
    // //                           const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
    // //                           await sleep(2000)
    // //                           await sendMessage(wbot, contact, ticket, body);
    // //                         });
    // //                       } else {
    // //                         let id_payment_overdue;
    // //                         let value_overdue;
    // //                         let description_overdue;
    // //                         let invoiceUrl_overdue;
    // //                         let dueDate_overdue;
    // //                         let invoiceNumber_overdue;
    // //                         let bankSlipUrl;
    // //                         let value_overdue_corrigida;
    // //                         let dueDate_overdue_corrigida;
    // //                         id_payment_overdue = response?.data?.data[0]?.id;
    // //                         value_overdue = response?.data?.data[0]?.value;
    // //                         description_overdue = response?.data?.data[0]?.description;
    // //                         invoiceUrl_overdue = response?.data?.data[0]?.invoiceUrl;
    // //                         dueDate_overdue = response?.data?.data[0]?.dueDate;
    // //                         invoiceNumber_overdue = response?.data?.data[0]?.invoiceNumber;
    // //                         bankSlipUrl = response?.data?.data[0]?.bankSlipUrl;
    // //                         dueDate_overdue_corrigida = dueDate_overdue?.split('-')?.reverse()?.join('/');
    // //                         value_overdue_corrigida = value_overdue.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    // //                         const body = `Você tem *${totalCount_overdue}* fatura(s) vencida(s)! \nVou te enviar. Por favor aguarde!`;
    // //                         await sleep(2000)
    // //                         await sendMessage(wbot, contact, ticket, body);
    // //                         const bodyBoleto = `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${invoiceNumber_overdue}\n*Nome:* ${nome}\n*Valor:* R$ ${value_overdue_corrigida}\n*Data Vencimento:* ${dueDate_overdue_corrigida}\n*Descrição:* ${description_overdue}\n*Link:* ${invoiceUrl_overdue}`
    // //                         await sleep(2000)
    // //                         await sendMessage(wbot, contact, ticket, bodyBoleto);
    // //                         //GET DADOS PIX
    // //                         var optionsGetPIX = {
    // //                           method: 'GET',
    // //                           url: `https://www.asaas.com/api/v3/payments/${id_payment_overdue}/pixQrCode`,
    // //                           headers: {
    // //                             'Content-Type': 'application/json',
    // //                             access_token: asaasToken
    // //                           }
    // //                         };
    // //                         axios.request(optionsGetPIX).then(async function (response) {
    // //                           let success;
    // //                           let payload;
    // //                           success = response?.data?.success;
    // //                           payload = response?.data?.payload;
    // //                           if (success === true) {
    // //                             const bodyPixCP = `Este é o *PIX Copia e Cola*!`;
    // //                             await sleep(2000)
    // //                             await sendMessage(wbot, contact, ticket, bodyPixCP);
    // //                             await sleep(2000)
    // //                             await sendMessage(wbot, contact, ticket, payload);
    // //                             let linkBoleto = `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=L|0&chl=${payload}`
    // //                             const nomePDF = ``
    // //                             await sleep(2000)
    // //                             await sendMessageImage(wbot, contact, ticket, linkBoleto, nomePDF)
    // //                             var optionsBoleto = {
    // //                               method: 'GET',
    // //                               url: `https://www.asaas.com/api/v3/payments/${id_payment_overdue}/identificationField`,
    // //                               headers: {
    // //                                 'Content-Type': 'application/json',
    // //                                 access_token: asaasToken
    // //                               }
    // //                             };
    // //                             axios.request(optionsBoleto).then(async function (response) {
    // //                               let codigo_barras
    // //                               codigo_barras = response.data.identificationField;
    // //                               if (bankSlipUrl?.length > 10) {
    // //                                 const body = `Este é o *PDF do boleto*!`;
    // //                                 await sleep(2000)
    // //                                 await sendMessage(wbot, contact, ticket, body);
    // //                                 const nomePDF = `${invoiceNumber_overdue}-${dueDate_overdue_corrigida.replaceAll('/', '-')}.pdf`
    // //                                 await sleep(2000)
    // //                                 await sendMessageLink(wbot, contact, ticket, bankSlipUrl, nomePDF)
    // //                               }
    // //                               if (response.data?.errors?.code !== 'invalid_action') {
    // //                                 const bodycodigo = `Este é o *Código de Barras*!`;
    // //                                 await sleep(2000)
    // //                                 await sendMessage(wbot, contact, ticket, bodycodigo);
    // //                                 await sleep(2000)
    // //                                 await sendMessage(wbot, contact, ticket, codigo_barras);
    // //                                 const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // //                                 await sleep(2000)
    // //                                 await sendMessage(wbot, contact, ticket, bodyfinaliza);
    // //                                 const ticketUpdateAgent = {
    // //                                   ticketData: {
    // //                                     status: "closed",
    // //                                     userId: 1,
    // //                                     sendFarewellMessage: false,
    // //                                     amountUsedBotQueues: 0
    // //                                   },
    // //                                   ticketId: ticket.id,
    // //                                   companyId: ticket.companyId,
    // //                                   ratingId: undefined
    // //                                 };
    // //                                 await sleep(2000)
    // //                                 await UpdateTicketService(ticketUpdateAgent);
    // //                               } else {
    // //                                 const bodyfinaliza = `Estamos finalizando esta conversa! Caso precise entre em contato conosco!`
    // //                                 await sleep(2000)
    // //                                 await sendMessage(wbot, contact, ticket, bodyfinaliza);
    // //                                 const ticketUpdateAgent = {
    // //                                   ticketData: {
    // //                                     status: "closed",
    // //                                     userId: 1,
    // //                                     sendFarewellMessage: false,
    // //                                     amountUsedBotQueues: 0
    // //                                   },
    // //                                   ticketId: ticket.id,
    // //                                   companyId: ticket.companyId,
    // //                                   ratingId: undefined
    // //                                 };
    // //                                 await sleep(2000)
    // //                                 await UpdateTicketService(ticketUpdateAgent);
    // //                               }
    // //                             }).catch(function (error) {
    // //                               //console.error(error);
    // //                             });
    // //                           }
    // //                         }).catch(function (error) { });
    // //                       }
    // //                     }).catch(async function (error) {
    // //                       const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
    // //                       await sleep(2000)
    // //                       await sendMessage(wbot, contact, ticket, body);
    // //                     });
    // //                   }
    // //                 }).catch(async function (error) {
    // //                   const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
    // //                   await sleep(2000)
    // //                   await sendMessage(wbot, contact, ticket, body);
    // //                 });
    // //               }
    // //             }
    // //           }
    // //         }
    // //       } else {
    // //         const body = `*Assistente Virtual:*\n\nCadastro não localizado! *CPF/CNPJ* incorreto ou inválido. Tenta novamente!`;
    // //         try {
    // //           await sleep(2000)
    // //           await sendMessage(wbot, contact, ticket, body);
    // //         } catch (error) {
    // //           console.log('Não consegui enviar a mensagem!')
    // //         }
    // //       }
    // //     }
    // //   }
    //  }
    if (String(selectedOption).toLocaleLowerCase() === "sair") {
        const ticketUpdateAgent = {
            ticketData: {
                status: "closed",
                sendFarewellMessage: true,
                amountUsedBotQueues: 0
            },
            ticketId: ticket.id,
            companyId: ticket.companyId
        };
        await (0, UpdateTicketService_1.default)(ticketUpdateAgent);
        // const complationMessage = ticket.whatsapp?.complationMessage;
        // const textMessage = {
        //   text: formatBody(`\u200e${complationMessage}`, ticket),
        // };
        // if (!isNil(complationMessage)) {
        //   const sendMsg = await wbot.sendMessage(
        //     `${ticket?.contact?.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        //     textMessage
        //   );
        //   await verifyMessage(sendMsg, ticket, ticket.contact);
        // }
        return;
    }
    if (selectedOption === "#") {
        const backTo = await backToMainMenu(wbot, contact, ticket, ticketTraking);
        return;
    }
    if (!getStageBot) {
        // Serviço p/ escolher consultor aleatório para o ticket, ao selecionar fila.
        // let randomUserId;
        // try {
        //   const userQueue = await ListUserQueueServices(queueId);
        //   if (userQueue.userId > -1) {
        //     randomUserId = userQueue.userId;
        //   }
        // } catch (error) {
        //   console.error(error);
        // }
        // // Ativar ou desativar opção de escolher consultor aleatório.
        // let settingsUserRandom = await Setting.findOne({
        //   where: {
        //     key: "userRandom",
        //     companyId: ticket.companyId
        //   }
        // });
        // console.log('randomUserId', randomUserId)
        // if (settingsUserRandom?.value === "enabled") {
        //   await UpdateTicketService({
        //     ticketData: { userId: randomUserId },
        //     ticketId: ticket.id,
        //     companyId: ticket.companyId,
        //     ratingId: undefined
        //   });
        // }
        const queue = await (0, ShowQueueService_1.default)(queueId, ticket.companyId);
        const selectedOptions = msg?.message?.buttonsResponseMessage?.selectedButtonId ||
            msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
            (0, wbotMessageListener_1.getBodyMessage)(msg);
        const choosenQueue = queue.chatbots[+selectedOptions - 1];
        if (choosenQueue) {
            if (choosenQueue.queueType === "integration") {
                try {
                    await ticket.update({
                        integrationId: choosenQueue.optIntegrationId,
                        useIntegration: true,
                        status: "pending",
                        queueId: null
                    });
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            else if (choosenQueue.queueType === "queue") {
                try {
                    const ticketUpdateAgent = {
                        ticketData: {
                            queueId: choosenQueue.optQueueId,
                            status: "pending"
                        },
                        ticketId: ticket.id
                    };
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            ...ticketUpdateAgent.ticketData,
                        },
                        ticketId: ticketUpdateAgent.ticketId,
                        companyId: ticket.companyId
                    });
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            else if (choosenQueue.queueType === "attendent") {
                try {
                    const ticketUpdateAgent = {
                        ticketData: {
                            queueId: choosenQueue.optQueueId,
                            userId: choosenQueue.optUserId,
                            status: "pending"
                        },
                        ticketId: ticket.id
                    };
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            ...ticketUpdateAgent.ticketData,
                        },
                        ticketId: ticketUpdateAgent.ticketId,
                        companyId: ticket.companyId
                    });
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            let send;
            if (choosenQueue?.greetingMessage && (!choosenQueue.optIntegrationId || ticket.typebotSessionTime === null)) {
                send = await sendDialog(choosenQueue, wbot, contact, ticket);
            } // nao tem mensagem de boas vindas
            if (choosenQueue.queueType === "file") {
                try {
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                    const files = await (0, ShowService_1.default)(choosenQueue.optFileId, ticket.companyId);
                    const folder = path_1.default.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id));
                    for (const [index, file] of files.options.entries()) {
                        const mediaSrc = {
                            fieldname: 'medias',
                            originalname: file.path,
                            encoding: '7bit',
                            mimetype: file.mediaType,
                            filename: file.path,
                            path: path_1.default.resolve(folder, file.path),
                        };
                        await (0, SendWhatsAppMedia_1.default)({ media: mediaSrc, ticket, body: file.name, isForwarded: false });
                    }
                    ;
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            if (choosenQueue.closeTicket) {
                await sendMsgAndCloseTicket(wbot, ticket.contact, ticket);
            }
            return send;
        }
    }
    if (getStageBot) {
        const selected = isNumeric(selectedOption) ? selectedOption : 1;
        const bots = await (0, ShowChatBotServices_1.default)(getStageBot.chatbotId);
        const choosenQueue = bots.options[+selected - 1]
            ? bots.options[+selected - 1]
            : bots.options[0];
        // console.log("linha 1508")
        if (!choosenQueue.greetingMessage) {
            await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
            return;
        } // nao tem mensagem de boas vindas
        if (choosenQueue) {
            if (choosenQueue.queueType === "integration") {
                try {
                    const ticketUpdateAgent = {
                        ticketData: {
                            integrationId: choosenQueue.optIntegrationId,
                            useIntegration: true,
                            status: "pending"
                        },
                        ticketId: ticket.id
                    };
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            ...ticketUpdateAgent.ticketData,
                        },
                        ticketId: ticketUpdateAgent.ticketId,
                        companyId: ticket.companyId
                    });
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            else if (choosenQueue.queueType === "queue") {
                try {
                    const ticketUpdateAgent = {
                        ticketData: {
                            queueId: choosenQueue.optQueueId,
                            status: "pending"
                        },
                        ticketId: ticket.id
                    };
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            ...ticketUpdateAgent.ticketData,
                        },
                        ticketId: ticketUpdateAgent.ticketId,
                        companyId: ticket.companyId
                    });
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            else if (choosenQueue.queueType === "attendent") {
                try {
                    const ticketUpdateAgent = {
                        ticketData: {
                            queueId: choosenQueue.optQueueId,
                            userId: choosenQueue.optUserId,
                            status: "pending"
                        },
                        ticketId: ticket.id
                    };
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            ...ticketUpdateAgent.ticketData,
                        },
                        ticketId: ticketUpdateAgent.ticketId,
                        companyId: ticket.companyId
                    });
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            // let send
            // if (choosenQueue?.greetingMessage) {
            //   send = await sendDialog(choosenQueue, wbot, contact, ticket);
            // } // nao tem mensagem de boas vindas
            if (choosenQueue.queueType === "file") {
                try {
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                    const files = await (0, ShowService_1.default)(choosenQueue.optFileId, ticket.companyId);
                    const folder = path_1.default.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id));
                    for (const [index, file] of files.options.entries()) {
                        const mediaSrc = {
                            fieldname: 'medias',
                            originalname: file.path,
                            encoding: '7bit',
                            mimetype: file.mediaType,
                            filename: file.path,
                            path: path_1.default.resolve(folder, file.path),
                        };
                        await (0, SendWhatsAppMedia_1.default)({ media: mediaSrc, ticket, body: file.name, isForwarded: false });
                    }
                    ;
                }
                catch (error) {
                    await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            if (choosenQueue.closeTicket) {
                await sendMsgAndCloseTicket(wbot, ticket.contact, ticket);
            }
            await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            const send = await sendDialog(choosenQueue, wbot, contact, ticket);
            return send;
        }
    }
};
exports.sayChatbot = sayChatbot;
