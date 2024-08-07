const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
    lang: String,
    type: { type: String, enum: ['phrase', 'word'] },
    title: { type: String, unique: true },
    label: { type: String },
    poster: String,
    posterUrl: String,
    mediaLang: String,
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
});

module.exports = {
    schema,
    wordCollections_model: mongoose.model('wordCollections', schema)
}