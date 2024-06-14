require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

// promptAI();
// generateImage();
async function promptAI(content, customMessages) {
  let messages = [{ role: 'user', content }]
  if (messages) {
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
  });
  const image_url = response.data[0].url;  
  return image_url
}

module.exports = {
  generateImage,
  promptAI,
}

