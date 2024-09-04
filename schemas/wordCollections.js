const { default: mongoose } = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

const Schema = require('mongoose').Schema;

const schema = new Schema({
    lang: String,
    title: String,
    type: { type: String, enum: ['phrase', 'word', 'mixed'] },
    label: { type: String },
    poster: String,
    posterUrl: String,
    mediaLang: String,
    level: String,
    keywords: [new Schema({
        the_word: String,
        romanized: String,
        meaning: String,
    })]
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
});
// mongoose.model('wordCollections', schema).collection.dropIndex('title_1')

schema.index({ mediaLang: 1, title: 1 }, { unique: true });

module.exports = {
    schema,
    wordCollections_model: mongoose.model('wordCollections', schema)
}