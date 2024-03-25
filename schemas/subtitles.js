const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
    label: String,
    title: String,
    forTitle: String,
    for: { type: String, required: true }, // movie, clip
    lang: { type: String },
    subtitles: [Schema.Types.Mixed]
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
})

module.exports = {
    schema,
    model: mongoose.model('subtitles', schema)
}