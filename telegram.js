const TelegramBot = require("node-telegram-bot-api");
const token = "5141360341:AAFBZhYyJdN6HLl6gclUHyoDJcpPgPYT0BM";

const bot = new TelegramBot(token, { polling: true });

module.exports = bot;
