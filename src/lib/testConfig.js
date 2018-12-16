const fs = require('fs');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const renderConfig = require('./renderConfig');
const exec = util.promisify(childProcess.exec);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

module.exports = async (config) => {
  const render = `events {}\nhttp {\n${await renderConfig(config)}\n}`;
  const filename = path.join(__dirname, `../../configs/${Date.now()}.conf.testing`);
  await writeFile(filename, render);
  let output = '';
  try {
    const { stdout, stderr } = await exec(`nginx -c "${filename}" -t`);
    output = stdout || stderr;
  } catch (err) {
    output = err.stderr || err.stdout;
  }
  await unlink(filename);
  return output.split(filename).join(`${config.domain}.conf`);
};
