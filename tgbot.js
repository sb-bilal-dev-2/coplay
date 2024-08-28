require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { initCRUDAndDatabase } = require("./serverCRUD");
const cron = require("node-cron");

const TOKEN = process.env.TG_BOT_TOKEN;
const TG_LOGIN = process.env.TG_LOGIN;
const QUIZ_PAGE = process.env.TG_LOGIN + "#/quiz/learning";
const bot = new TelegramBot(TOKEN, { polling: true });

initCRUDAndDatabase();

function showMainMenu(chatId) {
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Login", callback_data: "option1" }],
        [{ text: "Learn", callback_data: "option2" }],
        [{ text: "Set Notification for repeat", callback_data: "option3" }],
      ],
    }),
  };
  bot.sendMessage(chatId, "Please choose an option:", options);
}

bot.onText(/\/start(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = match[1].trim(); // This will contain your_custom_code or be empty

  if (userId) {
    // User came with a deep link containing a code
    bot.sendMessage(chatId, "Opening authentication page...", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open Auth Web App",
              web_app: {
                url: `${TG_LOGIN}/#/auth/login?userId=${userId}&telegramChatId=${chatId}`,
              },
            },
          ],
        ],
      },
    });
    console.log(
      "code provided",
      `${TG_LOGIN}/#/auth/login?userId=${userId}&telegramChatId=${chatId}`
    );
  } else {
    // User started the bot without a code
    showMainMenu(chatId);
  }
});

bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  const SIGN_UP_LINK = `${TG_LOGIN}/#/auth/login`;
  const LEARN = `${TG_LOGIN}/#/my_list`;

  switch (data) {
    case "option1":
      bot.answerCallbackQuery(callbackQuery.id, {
        text: "You selected Login. Please login.",
      });

      const inlineKeyboard1 = {
        inline_keyboard: [
          [
            {
              text: "Sign Up",
              web_app: { url: SIGN_UP_LINK },
            },
          ],
        ],
      };
      console.log("SIGN_UP_LINK", SIGN_UP_LINK);

      bot.sendMessage(chatId, "Click the button below to open the web app:", {
        reply_markup: inlineKeyboard1,
      });
      break;

    case "option2":
      bot.answerCallbackQuery(callbackQuery.id, {
        text: "You selected Option 2",
      });
      const inlineKeyboard2 = {
        inline_keyboard: [
          [
            {
              text: "Learn",
              web_app: { url: LEARN },
            },
          ],
        ],
      };

      bot.sendMessage(chatId, "Click the button below to open the web app:", {
        reply_markup: inlineKeyboard2,
      });
      break;

    case "option3":
      bot.answerCallbackQuery(callbackQuery.id, {
        text: "You selected Option 3",
      });
      bot.sendMessage(
        chatId,
        "When do you want to repeat the words? Please pick a time (e.g., 15:30):"
      );
      bot.once("message", (msg) => {
        const repeatTime = msg.text;
        console.log("Repeat time set to:", repeatTime);

        const [hours, minutes] = repeatTime.split(":");
        cron.schedule(`0 ${minutes} ${hours} * * *`, () => {
          const notificationKeyboard = {
            inline_keyboard: [
              [
                {
                  text: "Go to quiz page",
                  web_app: { url: QUIZ_PAGE },
                },
                {
                  text: "Learn words",
                  web_app: { url: LEARN },
                },
              ],
            ],
          };

          bot.sendMessage(
            chatId,
            "Time to repeat your words! Click the button below to start the quiz:",
            { reply_markup: notificationKeyboard }
          );
        });
      });
      break;

    default:
      bot.answerCallbackQuery(callbackQuery.id, { text: "Unknown option" });
  }
});