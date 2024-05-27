const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
    lang: String,
    for: String, // movie | wordCollection | clip
    forTitle: String,
    list: [String]
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
});

module.exports = {
    schema,
    phraseLists_model: mongoose.model('phraseLists', schema)
}