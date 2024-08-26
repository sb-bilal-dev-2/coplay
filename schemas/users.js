const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

const Schema = require("mongoose").Schema;

var usersWord = new Schema({
  isPhrase: Boolean,
  wordId: ObjectId,
  note: String,
  repeatCount: Number,
  repeatTime: { type: Date },
  learned: Boolean,
  lemma: String,
  the_word: String,
  archived: Boolean,
  contextType: String,
  contextMoment: String, // HH:MM:SS or chapter-1
  contextUrl: String,
  contextTitle: String,
});
const schema = new Schema({
  username: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  verificationCode: { type: Number },
  verifiedEmail: { type: Boolean, default: false },
  verificationCodeTimestamp: { type: Date },
  mainLanguage: String,
  premiumExpireDate: { type: Date, default: Date.now },
  learningLanguages: [String],
  words: [usersWord],
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
  isTelegramConnected: Boolean,
  chatId: String,
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

module.exports = {
  schema,
  users_model: mongoose.model("users", schema),
};
