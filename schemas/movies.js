const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  category: String,
  parsedSubtitleId: String,
  mediaTitleBase: String,
  keywords: [String],
  label: { type: String },
  description: {
    type: String,
  },
  mediaCharacters: [String],
  level: {
    type: String,
  },
  genre: [String],
  isPremium: Boolean,
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
  youtubeDetails: Schema.Types.Mixed,
  src: String,
  youtubeUrl: String,
  thumbnail: String,
  subtitleInfos: [Schema({ _id: String, title: { type: String, unique: true }, translateLang: String })]
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

module.exports = {
  schema,
  movies_model: mongoose.model('movies', schema)
}