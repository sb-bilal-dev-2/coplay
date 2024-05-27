// Creates new db collections and adds new language to database
// Creates web page translations
// Storaes language words in the database
// Runs processNewWords for the language
// const MAIN_LANGUAGES = ['uz', 'ru', 'en', 'cn', 'kr', 'jp', 'tr', 'kk', 'ky', 'az', 'ta', 'fa']
// const LEARNING_LANGUAGES = ['en', 'ru', 'cn', 'kr', 'jp', 'fr', 'sp', 'it', 'tr', 'uz', 'ar']

const MAIN_LANGUAGES = ['uz', 'ru', 'en', 'tr']
const LEARNING_LANGUAGES = ['kr', 'ru', 'en', 'tr', 'cn']

function processNewLanguages() {
    TRANSLATING_LANGUAGES.forEach((langCode) => {
        console.log('langCode', langCode)
    })
}

function processNewLearningLanguage() {

}

function processNewMainLanguage() {

}

module.exports = { MAIN_LANGUAGES, LEARNING_LANGUAGES }
