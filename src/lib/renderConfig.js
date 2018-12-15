const request = require('request-promise-native');

const port = process.env.PORT || 9002;
const host = process.env.HOST || 'localhost';

module.exports = (config) => {
  if (typeof config === 'string') {
    return request({
      method: 'GET',
      uri: `http://${host}:${port}/api/config/render/${config}`,
    });
  }
  return request({
    method: 'POST',
    uri: `http://${host}:${port}/api/config/render/`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
};
