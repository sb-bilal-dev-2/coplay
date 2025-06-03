require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

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
// getTranscriptionOfAudio('/Users/cosmo/Desktop/Cosmo/movieplayer/playground/glimpse_of_morning_light.mp4')

async function getTranscriptionOfAudio(filePath) {
  try {
    // Check if the file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} does not exist.`);
    }

    console.log("Starting transcription... for: " + filePath, path.resolve(filePath));
    const readStream = fs.createReadStream(path.resolve(filePath));
    readStream.on("error", (err) => {
      console.error("Error reading the file:", err);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: readStream, // Update the path if needed
      model: "gpt-4o-mini-transcribe", // "whisper-1"
      response_format: "json",
      timestamp_granularities: ["segment"],
      
    });
    console.log('transcription', transcription)
    if (transcription) {
      console.log("Transcription completed for: " + filePath);

      return transcription
    } else {
      console.log("Transcription did not return any text.");
    }
  } catch (error) {
    console.error("Error transcribing audio:", error);
  }
}

// Call the function to execute it

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
  const message = chatCompletion?.choices && chatCompletion.choices[0]?.message
  console.log('choices[0].message', message)

  return message
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
