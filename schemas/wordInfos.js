const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  lemma: String,
  occuranceCount: Number,
  lemmaIndex: Number,
  the_word: String,
  romanization: String,
  function: String,
  isLemma: Boolean,
  rootWord: String,
  functions: [String],
  pronounciation: String,
  mistyped: Boolean,
  slang: Boolean,
  vulgar: Boolean,
  isHomonym: Boolean,
  homophones: [String],
  homographs: [String],
  informal: Boolean,
  dialect: String,
  rude: Boolean,
  gender: String,
  irregular: Boolean,
  isHomonym: Boolean,
  homonyms: [String],
  homograms: [String],
  homophones: [String],
  within50k: Boolean,
  within5k: Boolean,
  isPhrase: Boolean,
  definitions: [
    Schema({
      definition: String,
      examples: [String],
      synonyms: [String]
    })
  ],
  images: [String],
  descriptiveImages: [String],
  youglishSrcs: [String],
  youglishOccurances: Number,
  youglishParsed: Boolean,
  translations: Schema.Types.Mixed,
  detailedExplanation: {
    default: {},
    type: Schema.Types.Mixed
  },
  shortExplanations: {
    default: {},
    type: Schema.Types.Mixed
  },
  shortDefinitions: {
    default: {},
    type: Schema.Types.Mixed
  },
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