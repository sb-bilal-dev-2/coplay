
/**
 * TODO(developer): Uncomment these variables before running the sample.\
 * (Not necessary if passing values as arguments)
 */

require("dotenv").config()
// process.env.GOOGLE_CREDENTIALS_PATH = "/Users/cosmo/Desktop/Cosmo/movieplayer/google_stored_key.json"

const project = process.env.GOOGLE_PROJECT_ID;
const location = 'asia-south1';
const aiplatform = require('@google-cloud/aiplatform');

const DEFAULT_PROMPT = `
  Define following phrase/word "let me down"
`

// Imports the Google Cloud Prediction service client
const {PredictionServiceClient} = aiplatform.v1;

// Import the helper module for converting arbitrary protobuf.Value objects.
const {helpers} = aiplatform;

const publisher = 'google';
const model = 'text-bison@001';

// Instantiates a client
const predictionServiceClient = new PredictionServiceClient({
    key: process.env.GOOGLE_API_KEY,
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

async function callPredict() {
  // Configure the parent resource
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

  const prompt = {
    prompt: '' || DEFAULT_PROMPT,
  };
  const instanceValue = helpers.toValue(prompt);
  const instances = [instanceValue];

  const parameter = {
    temperature: 0.2,
    maxOutputTokens: 256,
    topP: 0.95,
    topK: 40,
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  // Predict request
  const response = await predictionServiceClient.predict(request);
  console.log('Get text prompt response');
  // console.log(JSON.stringify(response[0].predictions[0], undefined, 2));
  console.log(JSON.stringify(response[0].predictions[0].structValue.fields.content.stringValue))
}

callPredict();