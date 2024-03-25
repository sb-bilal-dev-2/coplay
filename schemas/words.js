const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  lemma: {
    type: String,
    required: true,
  },
  interpolations: {
    type: String,
    required: true,
  },
  pronounciations: {
    type: String,
    required: true,
  },
  word_collections: [Schema({ type: { type: String, enum: ['movie', 'clip', 'short'] }, title: String })]
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

module.exports = {
  schema,
  model: mongoose.model('words', schema)
}