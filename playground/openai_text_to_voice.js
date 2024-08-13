const fs = require("fs");
const path = require("path");
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

const speechFile = path.resolve("./speech.mp3");

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    // input: "Today is a wonderful day to build something people love!",
    input: "내"
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
main();