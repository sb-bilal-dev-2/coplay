require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { initCRUDAndDatabase } = require("./serverCRUD");
const cron = require("node-cron");

const TOKEN = process.env.TG_BOT_TOKEN;
const TG_LOGIN = 'https://www.coplay.live/';
const QUIZ_PAGE = process.env.TG_LOGIN + "quiz/learning";
let bot = null;

// initCRUDAndDatabase();
// telegramInit()
function telegramInit() {
  bot = new TelegramBot(TOKEN, { polling: true })

  bot.onText(/\/start(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const params = match[1].trim(); // This will contain additional parameters or be empty

    if (params === 'auth') {
      // User wants to authenticate
      bot.sendMessage(chatId, "Please click the button below to authenticate:", {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Authenticate",
              url: `${TG_LOGIN}/auth/login?username=${username}&telegramChatId=${chatId}`
            }
          ]]
        }
      });
    } else if (params) {
      // User came with a deep link containing a code
      bot.sendMessage(chatId, "Opening authentication page...", {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Open Auth Web App",
              web_app: {
                url: `${TG_LOGIN}/auth/login?userId=${params}&telegramChatId=${chatId}`
              }
            }
          ]]
        }
      });
      console.log("code provided", `${TG_LOGIN}/auth/login?userId=${params}&telegramChatId=${chatId}`);
    } else {
      // User started the bot without any parameters
      showMainMenu(chatId);
    }
  });

  bot.on("callback_query", (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    switch (data) {
      case "option1":
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "You selected Login. Please login.",
        });
        bot.sendMessage(chatId, "Click the button below to open the web app:", {
          reply_markup: { remove_keyboard: true },
        });
        break;

      case "option2":
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "You selected Learn.",
        });
        bot.sendMessage(chatId, "Learning module loaded.", {
          reply_markup: { remove_keyboard: true },
        });
        break;

      case "option3":
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "You selected Set Notification.",
        });
        bot.sendMessage(chatId, "Notification settings updated.", {
          reply_markup: { remove_keyboard: true },
        });
        break;

      default:
        bot.answerCallbackQuery(callbackQuery.id, { text: "Unknown option." });
    }
  });
}

function showMainMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Login", callback_data: "option1" }],
        [{ text: "Learn", callback_data: "option2" }],
        [{ text: "Set Notification for repeat", callback_data: "option3" }],
      ],
    },
  };
  bot.sendMessage(chatId, "Please choose an option:", options);

  // Clear the keyboard after a timeout (optional)
  setTimeout(() => {
    bot.sendMessage(chatId, "Clearing keyboard...", {
      reply_markup: { remove_keyboard: true },
    });
  }, 30000); // Clear after 30 seconds
}

module.exports = {
  telegramInit
}
