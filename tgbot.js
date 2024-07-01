require('dotenv').configDotenv();
const TelegramBot = require('node-telegram-bot-api');
const { initCRUDAndDatabase } = require('./serverCRUD');
const { sortByLearningState } = require('./src/helper/sortByLearningState');
const { users_model } = require('./schemas/users');

const TOKEN = process.env.TG_BOT_TOKEN;
// const QUIZ_PAGE = process.env.REACT_APP_BASE_URL + '/quiz'

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
    console.log('resp', resp)
    const USER_TEMP_TOKEN = Math.floor(100000 + Math.random() * 900000)
    const TG_LOGIN_LINK = `${process.env.REACT_APP_BASE_URL}/login?telegram=${USER_TEMP_TOKEN}`
    if (resp === 'login') {
        console.log('TG_LOGIN_LINK', TG_LOGIN_LINK)

        LOGIN_RESPONSE = `
            # Thank You For Signing Up!
            - This is your temporary token: \`${USER_TEMP_TOKEN}\`
            - [Click here](${TG_LOGIN_LINK}) to login
        `
        bot.sendMessage(chatId, LOGIN_RESPONSE, { parse_mode: "Markdown"});
        // bot.sendVideo(chatId,)
    }
    // send back the matched "whatever" to the chat
});



// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;

//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(chatId, 'Recieved');
// });