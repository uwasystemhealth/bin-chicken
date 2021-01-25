const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async () => {
  const { stdout } = await exec('certbot certificates | grep ": "');
  const certs = {};
  let current = null;
  stdout.split('\n').forEach((line) => {
    if(!line) return;
    // split only on the first colon
    const [i, v] = line.trim().replace(': ', '::').split('::');
    if(i === 'Certificate Name') {
      current = v;
      certs[v] = { name: v };
    } else if(i === 'Expiry Date') {
      const [timestamp, valid] = v.split(' (VALID:');
      
      // If the certificate is not undefined from the result of the split
      // add to available certificates that are that can be used
      // For more information about invalid certificates, examine your certbot configuration
      if(!!valid){
        certs[current].expiry = {
          timestamp: new Date(timestamp),
          valid: valid.replace(/[)]/g, '').trim(),
        };
      }
    } else {
      certs[current][i.toLocaleLowerCase().replace(/\s/g, '_')] = v.trim();
    }
  });
  Object.keys(certs).forEach((i) => { certs[i].domains = certs[i].domains.split(' '); });
  return certs;
};
