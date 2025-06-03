// Replace with your actual Telegram Bot API token and DeepSeek API key
// const GEMINI_API_KEY = "AIzaSyBz8qidXm7iqQW6hdStEDhsFBxN3yWW64k"
// const { GoogleGenAI } = require("@google/genai");
// const db = require("./serverCRUD").initCRUDAndDatabase();
const words5k = require("./wordsResearchData/en_5kLemmas.json")
const fs = require('fs')

// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
// getChatbotResponse('Hey', 'angry')
async function getChatbotResponse(userInput, mood) {
    try {
        // ai.models
        const promptAI = require('./playground/openai.js').promptAI
        const response = await promptAI(undefined, {
            system: `You are a chatbot that responds in a ${mood} manner. Your goal is to teach 5 english words for user. Provide both an answer and three suggested user response options in JSON format: { botReply, userReplyOptions: [string] }`,
            contents: [
                {
                    role: "user",
                    content: `You are a chatbot that responds in a ${mood} manner. Provide both an answer and three suggested user response options in JSON format: { botReply, userReplyOptions: [string] }`
                },
                {
                    role: "user",
                    content: userInput
                }
            ]
        })
        // const response = await ai.models.generateContent({
        //     model: "gemini-2.0-flash",
        //     contents: [
        //         {
        //             role: "user",
        //             parts: [
        //                 { text: `You are a chatbot that responds in a ${mood} manner. Provide both an answer and three suggested user response options in JSON format: { botReply, userReplyOptions: [string] }` }
        //             ]
        //         },
        //         {
        //             role: "user",
        //             parts: [{ text: userInput }]
        //         }
        //     ],
        //   });
        console.log("response", response);
        return response;
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return "Error in fetching response.";
    }
}

const TELEGRAM_TOKEN = '7547928079:AAHJgNzm6gfiurF1OQe4YU6B3OkmbK2NXDw';
const TelegramBot = require('node-telegram-bot-api');
const { promptAI } = require("./playground/openai.js");
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
// Handle incoming messages

// Create bot with commands using node-telegram-bot-api. Add /langauge command that replies with buttons with langauges en English, zh Chinese etc. Add /100 command that replies with level buttons ['Beginner', 'Elementary', 'Pre-intermediate', 'Intermediate', 'Upper-intermediate', 'Advanced'], or ['HSK-1', 'HSK-2', 'HSK-3', 'HSK-4', 'HSK-5', 'HSK-6'] depending on the language, then upon choosing an item responds with 10 words that match those levels. Words would be fetched from DB.

// bot.onText(/.*/, async (msg) => {
//     const chatId = msg.chat.id;
//     const userInput = msg.text;
//     // Randomly choose a mood (angry or optimistic)
//     // const mood = Math.random() > 0.5 ? "angry" : "optimistic";
//     const mood = "optimistic";
//     const botResponse = await getChatbotResponse(userInput, mood);
//     const botResponseParsed = typeof botResponse === 'object' ? botResponse : JSON.parse(botResponse.replace('```json', '').replace('```', ''))
//     // const botResponseParsed = botResponse
//     // Extract response and options
//     console.log('botResponseParsed', botResponseParsed)
//     const keyboardOptions = botResponseParsed.userReplyOptions?.map((text) => [({ text, callback_data: text })])
//     console.log('message text', botResponseParsed.botReply)
//     bot.sendMessage(chatId, botResponseParsed.botReply, {
//         reply_markup: { inline_keyboard: keyboardOptions }
//     });
// });

// // Handle button presses
// bot.on('callback_query', async (callbackQuery) => {
//     const message = callbackQuery.message;
//     const chatId = message.chat.id;
//     const userFollowUp = callbackQuery.data;

//     // Get chatbot response based on follow-up input
//     const mood = "optimistic";
//     const botResponse = await getChatbotResponse(userFollowUp, mood);

//     // Extract response and options
//     const [botMessage, ...options] = botResponse.split('\n').filter(line => line.trim() !== '');
//     const keyboardOptions = options.slice(0, 3).map(opt => [{ text: opt, callback_data: opt }]);

//     bot.sendMessage(chatId, botMessage, {
//         reply_markup: { inline_keyboard: keyboardOptions }
//     });
// });

// User language preferences in-memory
const userLanguage = {};

// Supported languages and level mappings
const LEVELS_BY_LANG = {
  en: ['Beginner', 'Elementary', 'Pre-intermediate', 'Intermediate', 'Upper-intermediate', 'Advanced'],
  zh: ['HSK-1', 'HSK-2', 'HSK-3', 'HSK-4', 'HSK-5', 'HSK-6'],
};

// Simulated DB of words
const WORD_DB = {
  en: (level, day) => {
    const words1k = words5k.slice((level - 1) * 1000, level * 1000)
    const wordsOfDay = words1k.slice((day - 1) * 10, day * 10)?.map(item => item.lemma)
    return wordsOfDay
  },
  zh: (level, day) => {
    const words = fs.readFileSync(`./cn/hsk${level}.txt`, 'utf8').split('\n')
    const wordsOfDay = words.slice((day - 1) * 10, day * 10)
    return wordsOfDay
  },
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Select your language: with /language');
});
  
// Command: /language
bot.onText(/\/language/, (msg) => {
  const chatId = msg.chat.id;
  const langButtons = [
    [
      { text: 'English 🇬🇧', callback_data: 'lang_en' },
      { text: 'Chinese 🇨🇳', callback_data: 'lang_zh' },
    ],
  ];
  bot.sendMessage(chatId, 'Please select your language:', {
    reply_markup: { inline_keyboard: langButtons },
  });
});

// Command: /100
bot.onText(/\/100/, (msg) => {
  const chatId = msg.chat.id;
  const lang = userLanguage[chatId] || 'en';
  const levels = LEVELS_BY_LANG[lang];
  const text = msg.text
  console.log('text', text)
  if (!levels) {
    bot.sendMessage(chatId, 'Unsupported language. Use /language to select.');
    return;
  }
  const day = text.split(' ')[1]
  const levelButtons = levels.map((level, levelIndex) => [{ text: level, callback_data: `level_${levelIndex + 1}${day ? `_${day}` : ''}` }]);

  bot.sendMessage(chatId, `Select your level (${lang}):`, {
    reply_markup: { inline_keyboard: levelButtons },
  });
});

// Handle all callback queries
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  console.log("data", data)
  if (data.startsWith('lang_')) {
    handleLanguageSelection(chatId, callbackQuery);
  } else if (data.startsWith('level_')) {
    handleLevelSelection(chatId, callbackQuery);
  } else {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Unknown action.' });
  }
});

// Handle language selection
function handleLanguageSelection(chatId, callbackQuery) {
  const langCode = callbackQuery.data.split('_')[1];
  userLanguage[chatId] = langCode;

  const langName = langCode === 'en' ? 'English' : langCode === 'zh' ? 'Chinese' : 'Unknown';
  bot.answerCallbackQuery(callbackQuery.id, { text: `Language set to ${langName}` });
  bot.sendMessage(chatId, `✅ Language set to ${langName}. Use /100 1 to get words for day 1.`);
}

// Handle level selection and send words
async function handleLevelSelection(chatId, callbackQuery) {
  const level = callbackQuery.data.split('_')[1];
  const lang = userLanguage[chatId] || 'en';
  
  const day = callbackQuery.data.split('_')[2]
  const getWords = WORD_DB[lang];
  const words = getWords(level, day)
// for en get ./wordsResearchData/en_5kLemmas.json and items.lemma slice(0, 9)
// for zh get ./cn/hsk1.txt split('\n') slice(0, 9)
// for day 2 slice(9, 19) for day 3 slice(19, 29)

  if (!words) {
    bot.answerCallbackQuery(callbackQuery.id, { text: `No words found for ${level}` });
    bot.sendMessage(chatId, `❌ No words available for ${level} (${lang})`);
    return;
  }
  bot.answerCallbackQuery(callbackQuery.id);
  bot.sendMessage(chatId, `📚 Words for day ${day} of level ${level} ${lang}:\n\`${words.join(', ')}\``, {parse_mode: 'MarkdownV2'});
  try {
      bot.sendMessage(chatId, `Generating song text \-`, {parse_mode: 'MarkdownV2'})
      const lyrics = await promptAI(undefined, {
        system: `You are a bot that gives song lyrics that uses given words. Include different inflictions of words where appropriate, make it catchy and don't include words that are more advanced that given words. Use 3-5 words per line. Respond with plain lyrics of song that will be copy pasted to suno ai. e.g. [Title]: Hello\n[Verse1]:\nHello, it's me\nI was wondering if after all this you'd like to meet...`,
        contents: [
            {
                role: "user",
                content: `words: ${words.join(', ')}`
            }
        ]
      })
      bot.sendMessage(chatId, `${lyrics}`, {parse_mode: 'MarkdownV2'})
  } catch(err) {
    console.log('err', err)
    bot.sendMessage(chatId, `Error generating lyrics`, {parse_mode: 'MarkdownV2'});
  }
}
