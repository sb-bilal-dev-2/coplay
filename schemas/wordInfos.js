const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  lemma: String,
  occuranceCount: Number,
  lemmaIndex: Number,
  the_word: String,
  pronounciation: String,
  romanization: String,
  function: String,
  isLemma: Boolean,
  inflections: [String], // other wordInfo IDs
  translations: [Schema({
    lang: String,
    text: String,
  })],
  isHomonym: Boolean,
  homonyms: [String],
  homograms: [String],
  homophones: [String],
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
  wordInfos_model: mongoose.model('wordInfos', schema)
}