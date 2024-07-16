require("dotenv").configDotenv();
const TelegramBot = require("node-telegram-bot-api");
const { initCRUDAndDatabase } = require("./serverCRUD");
const { sortByLearningState } = require("./src/helper/sortByLearningState");
const { users_model } = require("./schemas/users");
const cron = require("node-cron");

const TOKEN = process.env.TG_BOT_TOKEN;
const TG_LOGIN_LINK = process.env.REACT_APP_BASE_URL;
const TG_LOGIN = process.env.TG_LOGIN;
const MESSAGE = "Hello! This is your daily notification message.";


cron.schedule(
  "23 16 * * *",
  () => {
    bot
      .sendMessage(chatId, MESSAGE)
      .then(() => console.log("Message sent successfully"))
      .catch((err) => console.error("Error sending message:", err));
  },
  {
    scheduled: true,
    timezone: "Asia/Tashkent", // e.g., 'Asia/Kolkata' for IST
  }
);

// const QUIZ_PAGE = process.env.REACT_APP_BASE_URL + '/quiz'

// replace the value below with the Telegram token you receive from @BotFather
initCRUDAndDatabase();
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
  const quizPageLink = "https://coplay.live/quiz/repeating?lang=en";

  bot.sendMessage(chatId, message);
}

bot.onText(/\/start=(.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  console.log("resp", resp);

  if (resp === "login") {
    const replyMarkup = {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Share phone number",
              request_contact: true,
            },
          ],
        ],
        one_time_keyboard: true,
      },
    };

    bot.sendMessage(chatId, "Please share your phone number:", replyMarkup);
  }

  // send back the matched "whatever" to the chat
});

bot.on("contact", (msg) => {
  const chatId = msg.chat.id;
  const phoneNumber = msg.contact.phone_number;
  const username = msg.from.username || "No username provided";

  bot.sendMessage(
    chatId,
    `Thank you for sharing your phone number: ${phoneNumber} and your username: ${username}`
  );

  // Send inline keyboard to open web app

  const SIGN_UP_LINK = `${TG_LOGIN_LINK}/auth/login?telegram=username=${username}&phoneNumber=${phoneNumber}`;
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "Sign Up",
          web_app: {
            url: SIGN_UP_LINK,
          },
        },
      ],
    ],
  };
  console.log("SIGN_UP_LINK", SIGN_UP_LINK);

  bot.sendMessage(chatId, "Click the button below to open the web app:", {
    reply_markup: inlineKeyboard,
  }); // bot.sendVideo(chatId,)

  console.log(
    `Phone number received from ${msg.from.first_name}: ${phoneNumber}`
  );
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;

//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(chatId, 'Recieved');
// });
