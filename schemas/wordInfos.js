const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  lemma: {
    type: String,
    required: true,
  },
  occuranceCount: Number,
  lemmaIndex: Number,
  inflections: [String],
  inflectionInfos: [Schema({
    text: String,
    pronounciation: String,
    romanization: String,
    function: String,
    translations: [Schema({
      lang: String,
      text: String,
    })]
  })],
  within50k: Boolean,
  within5k: Boolean,
  mainDefinition: String,
  meanings: [
    Schema({
      definition: String,
      examples: [String],
      synonyms: [String]
    })
  ],
  images: [String],
  descriptiveImages: [String],
  // pronounciations: {
  //   type: String,
  //   required: true,
  // },
  // word_collections: [
  //   Schema({ title: String, type: { type: String, enum: ['movie', 'clip', 'short'] } })
  // ]
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

module.exports = {
  schema,
  model: mongoose.model('wordInfos', schema)
}