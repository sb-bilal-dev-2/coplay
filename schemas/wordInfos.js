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
  translations: Schema.Types.Mixed,
  rootWord: String,
  functions: [String],
  pronounciation: String,
  detailedExplanation: String,
  shortExplanation: String,
  shortDefinition: String,
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
  mainDefinition: String,
  definitions: [
    Schema({
      definition: String,
      examples: [String],
      synonyms: [String]
    })
  ],
  images: [String],
  descriptiveImages: [String],
  the_word_translations: Schema.Types.Mixed,
  detailedExplanation_translations: Schema.Types.Mixed,
  shortExplanation_translations: Schema.Types.Mixed,
  shortDefinition_translations: Schema.Types.Mixed,
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