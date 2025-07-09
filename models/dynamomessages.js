const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'process.env.DYNAMO_TABLE';

module.exports = {
  async saveMessage({ username, avatar, message, timestamp }) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        username,
        avatar,
        message,
        timestamp: Number(timestamp),
      },
    };

    try {
      await dynamoDB.put(params).promise();
      console.log('✅ Message saved to DynamoDB');
    } catch (err) {
      console.error('❌ DynamoDB save error:', err);
    }
  },

  async getRecentMessages() {
    const params = {
      TableName: TABLE_NAME,
      Limit: 50,
    };

    try {
      const data = await dynamoDB.scan(params).promise();
      return data.Items
        .filter(item => item.message)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (err) {
      console.error('❌ DynamoDB fetch error:', err);
      return [];
    }
  },
};
