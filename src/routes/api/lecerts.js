const app = require('../../../app');
const getCerts = require('../../lib/getCurrentLE');

module.exports = async (req, res) => {
  let certs = null;
  try {
    certs = await getCerts();
  } catch(err) {
    console.error(err); // eslint-disable-line no-console
    throw new app.errors.Internal();
  }
  res.json(Object.values(certs).map(v => ({ name: v.name, domains: v.domains })));
};
