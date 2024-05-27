const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  label: { type: String },
  description: {
    type: String,
  },
  mediaCharacters: [String],
  level: {
    type: String,
  },
  genre: {
    type: String,
  },
  mediaUrl: {
    type: String,
  },
  posterUrl: {
    type: String
  },
  heroUrl: {
    type: String
  },
  subtitleUrl: {
    type: String,
  },
  mediaLang: {
    type: String,
  },
  subtitleLabels: [Schema({ id: String, label: String })]
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
});

module.exports = {
    schema,
    clips_model: mongoose.model('clips', schema)
}