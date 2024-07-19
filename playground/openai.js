require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs");

let openai

try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
  });
} catch(err) {
  console.log('OPENAI_CONNECTION_ERROR', err)
}
// generateImage();
// generateImagesForWords([
//   "Most Common 1000 Words in English",
//   "Most Common 1500 Phrases in English",
//   "Most Common 5000 Words in English",
//   "Common words 1000 to 2000",
//   "Business Vocabulary 101",
//   "IT Vocabulary 101",
//   "Travel Vocabulary 101"
// ]);

async function getTranscriptionOfAudio() {
  try {
    const filePath = "public/pizza.mp3";
    // Check if the file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} does not exist.`);
    }

    console.log("Starting transcription...");
    const readStream = fs.createReadStream(filePath);
    readStream.on("error", (err) => {
      console.error("Error reading the file:", err);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: readStream, // Update the path if needed
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    console.log(transcription);
    if (transcription && transcription) {
      console.log("Transcription completed:");
    } else {
      console.log("Transcription did not return any text.");
    }
  } catch (error) {
    console.error("Error transcribing audio:", error);
  }
}

// Call the function to execute it
getTranscriptionOfAudio();

async function promptAI(content, customMessages) {
  let messages = [{ role: 'user', content }]
  if (!content) {
    messages = customMessages
  }
  if (!openai) {
    throw new Error('NetworkError')
  }
  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
    temperature: 0.0
  });

  console.log('res', chatCompletion)
  console.log('choices[0].message', chatCompletion.choices[0].message)

  return chatCompletion?.choices[0]?.message
}

async function generateImage(prompt) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    // size: "512x512",
  });
  const image_url = response.data[0].url;
  return image_url;
}

async function generateImagesForWords(words = []) {
  return Promise.all(
    words.map(async (item) => {
      res = await generateImage(
        `Icon style simple, no text allowed. Icon for the given phrase/word: ` +
          item
      );
      console.log(item, res);
      return [item, res];
    })
  );
}

module.exports = {
  generateImage,
  promptAI,
  getTranscriptionOfAudio,
};
