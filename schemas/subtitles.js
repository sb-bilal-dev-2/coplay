const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
    label: String,
    title: { type: String, required: true },
    mediaTitle: String,
    mediaId: { type: String, required: true },
    mediaLang: { type: String, required: true },
    translateLang: String,
    subtitles: [Schema.Types.Mixed],
    usedLemmas: [Schema.Types.Mixed],
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
})

schema.index({ mediaId: 1, translateLang: 1, title: 1 }, { unique: true });

module.exports = {
    schema,
    subtitles_model: mongoose.model('subtitles', schema)
}