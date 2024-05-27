
const fs = require('fs');
// import fetch from 'node-fetch';
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    organization: 'org-mOMcyTD9iW39BlGejPzM622u',
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

fineTune()
async function fineTune() {
    const readStream = fs.createReadStream('openaidataset.jsonl')
    await openai.files.create({ file: readStream, purpose: 'fine-tune' });
    
    const fineTune = await openai.fineTuning.jobs.create({ training_file: 'file-abc123', model: 'gpt-3.5-turbo' })
    console.log('fineTune', JSON.stringify(fineTune, undefined, 2))
}
// If you have access to Node fs we recommend using fs.createReadStream():
// async function main() {
//     const completion = await openai.chat.completions.create({
//       messages: [{ role: "system", content: "You are a helpful assistant." }],
//       model: "ft:gpt-3.5-turbo:org-mOMcyTD9iW39BlGejPzM622u:file-abc123:id",
//     });
//     console.log(completion.choices[0]);
//   }
//   main();
  