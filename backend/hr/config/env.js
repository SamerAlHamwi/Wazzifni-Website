const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wazifni',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'Wazzifni',
  SMS_BASE_URL: process.env.SMS_BASE_URL || 'https://gateway.standingtech.com/api/v5/sms/send',
};