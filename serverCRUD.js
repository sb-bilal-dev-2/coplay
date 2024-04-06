// Import necessary modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const DB_USER = process.env.DATABASE_USER;
const DB_PWD = process.env.DATABASE_PASSWORD;
const SCHEMAS_PATH = './schemas'
// Initialize Express app and middleware
let app;
let models = {}

// Function to initialize MongoDB connection
const initCRUDAndDatabase = (ownApp) => {
  if (!app) {
    if (ownApp) {
      app = ownApp;
    } else {
      app = express()
      app.use(bodyParser.json());
      app.use(cors({
        origin: '*'
      }));
      app.listen(8080, () => {
        console.log(`Server is running on 8080 ${8080}`);
      });
    }
  }
  mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PWD}@cluster0.lwg2plw.mongodb.net/?retryWrites=true&w=majority`);
  return {
    app,
    mongoose,
    createCRUDEndpoints,
    models,
  }
};
// Function to create CRUD endpoints
const createCRUDEndpoints = (uri, model, requireAuth) => {
  // Load Mongoose schema from the provided path
  let Model = model;

  if (!model) {
    // const schema = require(`${SCHEMAS_PATH}/${uri}.js`);

    // // Add createdTime, updatedTime, and note keys to the schema
    // schema.add({
    //   createdTime: { type: Date, default: Date.now },
    //   updatedTime: { type: Date, default: Date.now },
    //   note: String,
    // });
  
    // Create a Mongoose model
    Model = require(`${SCHEMAS_PATH}/${uri}.js`).model;
  }
  models[uri] = Model;

  // CRUD Endpoints
  const DEFAULT_ITEM_LIMIT = 20;
  app.get(`/${uri}`, async (req, res) => {
    // Retrieve data from the database
    try {
      const filterQuery = getFilterFromQuery(req.query)
      let query = Model.find(filterQuery);

      // Search functionality
      // if (req.query.match) {
      //   const matchKey = req.query.matchKey || 'title';

      //   const match = req.query.match;
      //   query = query.where(matchKey).equals(match);
      // }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || DEFAULT_ITEM_LIMIT;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      query = query.skip(startIndex).limit(limit);

      // Sorting functionality
      if (req.query.sort_by) {
        const sortBy = req.query.sort_by;
        const sortOrder = req.query.sort_desc === 'true' ? -1 : 1;
        query = query.sort({ [sortBy]: sortOrder });
      }

      // Pagination include next & prev page numbers in result
      const data = await query.exec();
      const result = {};
      if (endIndex < data.length) {
        result.next = {
          page: page + 1,
          limit: limit,
        };
      }

      if (startIndex > 0) {
        result.prev = {
          page: page - 1,
          limit: limit,
        };
      }

      result.results = data.slice(startIndex, endIndex);

      res.json(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  app.get(`/${uri}/:id`, async (req, res) => {
    // Retrieve a single object by ID
    try {      
      const id = req.params.id;
      console.log('Model', Model)
      console.log('Model.findById', Model.findById)

      const data = await Model.findById(id);

      if (!data) {
        return res.status(404).send('Data not found');
      }

      res.json(data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  app.post(`/${uri}/:id`, async (req, res) => {
    // Update a single object or multiple objects by ID
    try {
      if (!req.params._id) { // if no id provided then update bulk
        const bulkUpdateOps = req.body.map(update => ({
          updateOne: {
            filter: { _id: update._id },
            update: { $set: update },
          },
        }));

        const result = await Model.bulkWrite(bulkUpdateOps);
        res.json(result);
      } else { // update single item
        const id = req.params.id;
        const updatedData = await Model.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedData);  
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  app.put(`/${uri}`, async (req, res) => {
    // Create a new document or multiple documents
    try {

      console.log('post', req.body)
      if (Array.isArray(req.body)) {

        const newData = await Model.insertMany(req.body);
        res.json(newData);
      } else {
        const newData = new Model(req.body);
        const savedData = await newData.save();
        res.json(savedData);
      }
    } catch (error) {
      console.log('code', error.code)
      console.log('code', error.statusCode)
      console.log('err', error.message)
      if (error.message.includes("validation failed:")) {
        return res.status(400).send(error.message)
      }
      res.status(500).send(error.message);
    }
  });
  app.patch(`/${uri}/:id`, async (req, res) => {
    // Update existing document by ID
    try {
      const id = req.params.id;
      const existingData = await Model.findById(id);

      if (!existingData) {
        return res.status(404).send('Data not found');
      }

      // Update only received body keys
      Object.keys(req.body).forEach(key => {
        existingData[key] = req.body[key];
      });

      existingData.updatedTime = Date.now();
      const updatedData = await existingData.save();
      res.json(updatedData);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  app.delete(`/${uri}/:id`, async (req, res) => {
    // Delete document by ID
    try {
      const id = req.params.id;
      const deletedData = await Model.findByIdAndDelete(id);

      if (!deletedData) {
        return res.status(404).send('Data not found');
      }

      res.json(deletedData);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
};

function getFilterFromQuery(query) {
  const filterQuery = { ...query, limit: null, page: null, match: null }

  Object.keys(query).forEach((key) => {
    const queryValue = query[key]
    let queryValueJSON;
    try {
      queryValueJSON = JSON.parse(queryValue)
      if (queryValueJSON !== null) {
        query[key] = queryValueJSON;
      }
    } catch (err) {

    }
  })

  return filterQuery;
}

// Export the functions
module.exports = {
  initCRUDAndDatabase,
  createCRUDEndpoints,
  models
};
