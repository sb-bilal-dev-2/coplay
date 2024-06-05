const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = Schema({
  mediaType: { type: String, enum: ['movie', 'clip', 'short'] },
  src: String,
  startTime: Number,
  endTime: Number,
  mediaTitle: String,
  mediaId: String,
  mediaTitleBase: String,
  context: [String],
  lemmaOccuranceCount: Number,
  lemmaOccuranceCountOnContext: Number,
  occuranceIndex: Number,
  contextSubtitles: [Schema({
    usedWords: [String],
    usedLemmas: [String],
    usedPhrases: [String],
    romanized: String,
    startTime: Number,
    endTime: Number,
  })],
  hashtags: [String],
  genres: [String],
  series: String, // e.g. S1, E12
  lemma: String,
  inflection: String,
  isPhrase: Boolean,
  usedWords: String,
  mediaLang: String,
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

schema.index({ mediaId: 1, startTime: 1, lemma: 1 }, { unique: true });
// error.code === 11000 // duplicate key error

module.exports = {
  schema,
  occurances_model: mongoose.model('occurances', schema)
}