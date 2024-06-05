const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  parsedSubtitleId: String,
  mediaTitleBase: String,
  label: { type: String },
  description: {
    type: String,
  },
  mediaCharacters: [String],
  level: {
    type: String,
  },
  genre: [String],
  mediaUrl: {
    type: String,
  },
  posterUrl: {
    type: String
  },
  heroUrl: {
    type: String
  },
  originalSubtitleUrl: {
    type: String,
  },
  hashtags: [String],
  mediaType: String,
  series: String,
  mediaLang: {
    type: String,
    required: true,
  },
  subtitleInfos: [Schema({ id: String, title: String, translateLang: String })]
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

module.exports = {
  schema,
  movies_model: mongoose.model('movies', schema)
}