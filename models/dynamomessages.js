// models/dynamomessages.js
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'ChatsTable';

async function saveMessage(message) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      roomId: 'global',
      timestamp: message.timestamp,
      username: message.username,
      message: message.message,
      avatar: message.avatar
    }
  };

  return docClient.put(params).promise();
}

async function getRecentMessages(limit = 50) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'roomId = :room',
    ExpressionAttributeValues: {
      ':room': 'global'
    },
    ScanIndexForward: false,
    Limit: limit
  };

  try {
    const data = await docClient.query(params).promise();
    return data.Items.reverse();
  } catch (err) {
    console.error("❌ DynamoDB fetch error:", err);
    return [];
  }
}

module.exports = {
  saveMessage,
  getRecentMessages
};
