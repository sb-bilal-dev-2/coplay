const { ObjectId } = require('mongodb');
const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

var usersWords = new Schema({
    isPhrase: Boolean,
    wordId: ObjectId,
    note: String,
    rehearsedTimes: Number,
    learned: Boolean,
    lemma: String,
    archived: Boolean,
    postponedTill: Date,
    contextType: String,
    contextMoment: String, // HH:MM:SS or chapter-1
    contextUrl: String,
    contextTitle: String,
});
const schema = new Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationCode: { type: Number },
    verifiedEmail: { type: Boolean, default: false },
    verificationCodeTimestamp: { type: Date },
    words: [usersWords],
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
});

module.exports = {
    schema,
    model: mongoose.model('users', schema)
}