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
  mediaLanguage: {
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
  model: mongoose.model('movies', schema)
}