const { default: mongoose } = require("mongoose");

const Schema = require("mongoose").Schema;

const schema = new Schema({
  mediaLang: String,
  title: String,
  list: [String],
}).add({
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
  note: String,
});

module.exports = {
  schema,
  playList_model: mongoose.model("playList", schema),
};
