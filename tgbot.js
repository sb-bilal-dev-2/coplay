const TelegramBot = require('node-telegram-bot-api');
const { initCRUDAndDatabase } = require('./serverCRUD');
const { sortByLearningState } = require('./src/helper/sortByLearningState');
const { users_model } = require('./schemas/users');
const TOKEN = '6547980014:AAGEkQkfl22yuth9ANe9uDpM4Tw9x_SmN6U';

// replace the value below with the Telegram token you receive from @BotFather
initCRUDAndDatabase()
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, { polling: true });
// wordInfos_model
// bot.sendMessage(chatId, resp);

// bot.sendMessage(chatId, resp);
// bot.setChatMenuButton(
//     {
//         chat_id: chatId,
//         menu_button: { type: "web_app", text: "repeat", web_app: { url: 'https://coplay.live/quiz' } }
//     }
// )

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// https://t.me/cosmo_ingiliz_bot?start=login
// https://t.me/cosmo_ingiliz_bot?start=login
async function notifyForRepeatingWords() {
    const message = `Repeat Your English Words `;
    const quizPageLink = 'https://coplay.live/quiz/repeating?lang=en'

    bot.sendMessage(chatId, message);
}

bot.onText(/\/start=(.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    const USER_TEMP_TOKEN = 'Math.floor(100000 + Math.random() * 900000)'
    const TG_LOGIN_LINK = `${BASE_CLIENT_URL}/login?telegram=${USER_TEMP_TOKEN}`

    if (resp === 'login') {
        LOGIN_RESPONSE = `
            This is your temporary token:
            ${USER_TEMP_TOKEN}
            Click following link for Sign-up: ${TG_LOGIN_LINK}
        `

        bot.sendVideo(chatId,)
    }
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});



// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Recieved');
});