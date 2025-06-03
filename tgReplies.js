// Replace with your actual Telegram Bot API token and DeepSeek API key
const GEMINI_API_KEY = "AIzaSyBz8qidXm7iqQW6hdStEDhsFBxN3yWW64k"
const { GoogleGenAI } = require("@google/genai");
const db = require("./serverCRUD").initCRUDAndDatabase();

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

const TELEGRAM_TOKEN = '7547928079:AAEA2tKIVFEFt8hpcEoGuFUmOiw0Q8ql5N0';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
// Handle incoming messages
bot.onText(/.*/, async (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;
    // Randomly choose a mood (angry or optimistic)
    // const mood = Math.random() > 0.5 ? "angry" : "optimistic";
    const mood = "optimistic";
    const botResponse = await getChatbotResponse(userInput, mood);
    const botResponseParsed = typeof botResponse === 'object' ? botResponse : JSON.parse(botResponse.replace('```json', '').replace('```', ''))
    // const botResponseParsed = botResponse
    // Extract response and options
    console.log('botResponseParsed',botResponseParsed)
    const keyboardOptions = botResponseParsed.userReplyOptions?.map((text) => [({ text, callback_data: text })])
    console.log('message text', botResponseParsed.botReply)
    bot.sendMessage(chatId, botResponseParsed.botReply, {
        reply_markup: { inline_keyboard: keyboardOptions }
    });
});

// Handle button presses
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const userFollowUp = callbackQuery.data;

    // Get chatbot response based on follow-up input
    const mood = "optimistic";
    const botResponse = await getChatbotResponse(userFollowUp, mood);

    // Extract response and options
    const [botMessage, ...options] = botResponse.split('\n').filter(line => line.trim() !== '');
    const keyboardOptions = options.slice(0, 3).map(opt => [{ text: opt, callback_data: opt }]);

    bot.sendMessage(chatId, botMessage, {
        reply_markup: { inline_keyboard: keyboardOptions }
    });
});
