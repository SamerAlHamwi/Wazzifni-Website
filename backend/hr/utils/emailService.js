// This service is deprecated and replaced by smsService.js
module.exports = {
  sendEmail: () => {
    console.warn('sendEmail is deprecated. Use sendSMS from smsService.js instead.');
    return Promise.resolve();
  }
};