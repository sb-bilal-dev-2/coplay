const { default: mongoose } = require('mongoose');

const Schema = require('mongoose').Schema;

const schema = new Schema({
    questionType: String, // how-to-say, guess-object, what-it-means
    question: String,
    imgUrl: String,
    options: [String],
    correctAnswers: [Number],
    learningLang: String,
    teachingLang: String,
}).add({
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now },
    note: String,
});

module.exports = {
    schema,
    model: mongoose.model('quizzes', schema)
}