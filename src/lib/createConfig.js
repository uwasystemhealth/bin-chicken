const fs = require('fs');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const renderConfig = require('./renderConfig');
const exec = util.promisify(childProcess.exec);
const writeFile = util.promisify(fs.writeFile);

module.exports = async (config, restart = true) => {
  const render = await renderConfig(config);
  const filename = path.join(__dirname, `../../configs/${config.domain}.conf`);
  await writeFile(filename, render);
  if(!restart) return;
  let output = '';
  try {
    const { stdout, stderr } = await exec('service nginx restart');
    output = stdout || stderr;
  } catch (err) {
    output = err.stderr || err.stdout;
    console.error(output); // eslint-disable-line no-console
  }
};
