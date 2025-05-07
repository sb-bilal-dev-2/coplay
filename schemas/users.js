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
  email: { type: String, unique: true},
  password: { type: String },
  verificationCode: { type: Number },
  verifiedEmail: { type: Boolean, default: false },
  verificationCodeTimestamp: { type: Date },
  history: [],
  mainLanguage: String,
  premiumExpireDate: { type: Date, default: Date.now },
  learningLanguages: [String],
  words: [usersWord],
  ["words_en"]: [usersWord],
  ["words_zh-CN"]: [usersWord],
  ["words_es"]: [usersWord],
  ["words_ru"]: [usersWord],
  ["words_fr"]: [usersWord],
  ["words_tr"]: [usersWord],
  ["words_kr"]: [usersWord],
  ["words_jp"]: [usersWord],
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
