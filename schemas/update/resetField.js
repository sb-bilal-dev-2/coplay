require('dotenv').config();

const mongoose = require('mongoose');
const { schema } = require('../wordInfos');

const DB_USER = process.env.DATABASE_USER;
const DB_PWD = process.env.DATABASE_PASSWORD;

const mongooseConnectionUri = `mongodb+srv://${DB_USER}:${DB_PWD}@cluster0.lwg2plw.mongodb.net/?retryWrites=true&w=majority`
console.log('Mongoose URI: ' + mongooseConnectionUri)
mongoose.connect(mongooseConnectionUri);
const MyModel = mongoose.model('wordInfos__ko__s', schema) // or wordInfos_model

update()
async function update() {
    try {
        await MyModel.updateMany({}, { $set: { shortExplanations: {}, shortDefinitions: {}, translations: {}, detailedExplanations: {} } });
    } catch (err) {
        console.log('err', err)
    }
    console.log('updated')   
}
