/**
 * Imports the Google Cloud client library
 * Trnslt Docs @see https://cloud.google.com/nodejs/docs/reference/translate/latest/translate/v2.translate
 * API KEY DOC @see https://cloud.google.com/api-keys/docs/overview
 * Console @see https://console.cloud.google.com/apis
*/

const { Translate } = require('@google-cloud/translate').v2;

require('dotenv').config()
const translate = new Translate({ key: process.env.GOOGLE_API_KEY });

async function gTranslate(text, target) {
    // The text to translate
    // const text = 'The text to translate';
    // Translates some text into Russian
    const [translation] = await translate.translate(text, target);
    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);
    return translation
}

// gTranslate();  
module.exports = { gTranslate }