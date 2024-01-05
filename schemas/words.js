const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
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
  }
});

module.exports = exampleSchema;
