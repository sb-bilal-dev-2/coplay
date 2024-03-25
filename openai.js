require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

mainPromptDesign();
// generateImage();
async function mainPromptDesign() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });

  console.log('res', chatCompletion)
  console.log('choices[0].message', chatCompletion.choices[0].message)
}

async function generateImage() {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: "Create poster for 'home alone' movie",
    n: 1,
    size: "1024x1024",
  });
  console.log('response.data', response.data)
  image_url = response.data[0].url;  
  console.log('image_url', image_url);
}

