const app = require('../../../app');
const getCerts = require('../../lib/getCurrentLE');

module.exports = async (req, res) => {
    try {
        const certs = await getCerts();
    } catch(err) {
        console.error(err);
        throw new app.errors.Internal();
    }
    res.json(Object.values(certs).map(v => ({name: v.name, domains: v.domains})));
};
