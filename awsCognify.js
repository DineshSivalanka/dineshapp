// awsCognify.js
const AWS = require('aws-sdk');
require('dotenv').config(); // Load from .env

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
module.exports = dynamoDB;
