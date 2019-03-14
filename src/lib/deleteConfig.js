const fs = require('fs');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);
const unlink = util.promisify(fs.unlink);

module.exports = async (config) => {
  const filename = path.join(__dirname, `../../configs/${config.key || config._id}.conf`);
  await unlink(filename);
  let output = '';
  try {
    const { stdout, stderr } = await exec('service nginx restart');
    output = stdout || stderr;
  } catch (err) {
    output = err.stderr || err.stdout;
    console.error(output); // eslint-disable-line no-console
  }
};
