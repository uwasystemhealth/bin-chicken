const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = getCerts = async () => {
    const { stdout } = await exec('certbot certificates | grep ": "');
    const certs = {};
    let current = null;
    stdout.split('\n').forEach( (line) => {
        if(!line) return;
        // split only on the first colon
        const [i, v] = line.trim().replace(': ', '::').split('::');
        if(i === 'Certificate Name'){
            current = v;
            certs[v] = { name: v };
        } else if(i === 'Expiry Date') {
            const [timestamp, valid] = v.split(' (VALID:');
            certs[current].expiry= {
                timestamp: new Date(timestamp),
                valid: valid.replace(/[)]/g, '').trim(),
            };
        } else {
            certs[current][i.toLocaleLowerCase().replace(/\s/g, '_')] = v.trim();
        }
    });
    certs.domains = certs.domains.split(' ');
    return certs;
};