require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});
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
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/temp_audio.mp3"),
    model: "whisper-1",
  });

  console.log(transcription.text);
}

async function promptAI(content, customMessages) {
  let messages = [{ role: 'user', content }]
  if (!content) {
    messages = customMessages
  }
  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
  });

  console.log('res', chatCompletion)
  console.log('choices[0].message', chatCompletion.choices[0].message)
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
  return image_url
}

async function generateImagesForWords(words = []) {
  return Promise.all(words.map(async (item) => {
    res = await generateImage(`Icon style simple, no text allowed. Icon for the given phrase/word: ` + item);  
    console.log(item, res)
    return [item, res]
  }))
}

module.exports = {
  generateImage,
  promptAI,
}

