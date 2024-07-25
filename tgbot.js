require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { initCRUDAndDatabase } = require("./serverCRUD");
const cron = require("node-cron");

const TOKEN = process.env.TG_BOT_TOKEN;
const TG_LOGIN = process.env.TG_LOGIN;
const QUIZ_PAGE = process.env.TG_LOGIN + "#/quiz/learning";

initCRUDAndDatabase();
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start=(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  console.log("resp", resp);

  if (resp === "login") {
    const SIGN_UP_LINK = `${TG_LOGIN}/#/auth/login`;
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
    });
  }

  const LEARN = `${TG_LOGIN}/#/my_list`;
  if (resp === "learn") {
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Learn",
            web_app: {
              url: LEARN,
            },
          },
        ],
      ],
    };
    console.log("LEARN", LEARN);

    bot.sendMessage(chatId, "Click the button below to open the web app:", {
      reply_markup: inlineKeyboard,
    });
  }

  if (resp === "repeat") {
    bot.sendMessage(
      chatId,
      "When do you want to repeat the words? Please pick a time (e.g., 15:30):"
    );
    bot.once("message", (msg) => {
      const repeatTime = msg.text;
      console.log("Repeat time set to:", repeatTime);

      cron.schedule(
        `0 ${repeatTime.split(":")[1]} ${repeatTime.split(":")[0]} * * *`,
        () => {
            const notificationKeyboard = {
              inline_keyboard: [
                [
                  {
                    text: "Go to quiz page",
                    web_app: {
                      url: QUIZ_PAGE,
                    },
                  },
                ],
                [
                  {
                    text: "Learn words",
                    web_app: {
                      url: LEARN,
                    },
                  },
                ],
              ],
            };

          bot.sendMessage(
            chatId,
            "Time to repeat your words! Click the button below to start the quiz:",
            {
              reply_markup: notificationKeyboard,
            }
          );
        }
      );

      const testNotificationKeyboard = {
        inline_keyboard: [
          [
            {
              text: "Go to Quiz",
              url: QUIZ_PAGE,
            },
          ],
        ],
      };

      bot.sendMessage(
        chatId,
        "This is a test notification. Click the button below to start the quiz:",
        {
          reply_markup: testNotificationKeyboard,
        }
      );
    });
  }
});
