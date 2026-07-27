const https = require('https');
const { SMS_API_KEY, SMS_SENDER_ID, SMS_BASE_URL } = require('../config/env');
const AppError = require('./AppError');

/**
 * Send SMS via StandingTech / VerifyWay API
 * @param {string} recipient - Phone number (e.g., 9647502171212)
 * @param {string} message - Message text
 * @param {string} apiKey - Optional API key (overrides env)
 * @returns {Promise<any>}
 */
const sendSMS = async (recipient, message, apiKey) => {
  return new Promise((resolve, reject) => {
    const url = new URL(SMS_BASE_URL);

    // Clean up recipient: remove '+' and any non-digit characters
    const cleanRecipient = recipient ? String(recipient).replace(/\D/g, '') : '';

    const data = JSON.stringify({
      recipient: cleanRecipient,
      sender_id: SMS_SENDER_ID,
      message: message ? message.trim() : '',
    });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey || SMS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            console.error('SMS API Error Response:', responseBody);

            // Extract error message correctly even if it's an object or array
            let errorMsg = parsedData.message || parsedData.error || parsedData.errors || `Request failed with status ${res.statusCode}`;

            if (typeof errorMsg === 'object') {
              errorMsg = JSON.stringify(errorMsg);
            }

            reject(new AppError(`SMS Provider Error: ${errorMsg}`, res.statusCode));
          }
        } catch (e) {
          console.error('SMS API Raw Error Response:', responseBody);
          reject(new AppError(`Failed to parse SMS provider response: ${responseBody.substring(0, 100)}`, 500));
        }
      });
    });

    req.on('error', (error) => {
      reject(new AppError(`SMS Connection Error: ${error.message}`, 500));
    });

    req.write(data);
    req.end();
  });
};

module.exports = { sendSMS };