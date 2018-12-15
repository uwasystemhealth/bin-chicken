const fs = require('fs');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const createConfig = require('./createConfig');
const exec = util.promisify(childProcess.exec);
const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);
const app = require('../../app');

module.exports = async () => {
  const dir = path.join(__dirname, '../../configs/');
  // clear all conf files
  const files = await readdir(dir);
  await Promise.all(files.map(async (filename) => {
    if(/.conf$/.test(filename)) await unlink(`${dir}${filename}`);
  }));
  // write new conf files
  const configs = await app.models.config.find().whereValid();
  await Promise.all(configs.map(config => createConfig(config, false)));
  // restart
  let output = '';
  try {
    const { stdout, stderr } = await exec('service nginx restart');
    output = stdout || stderr;
  } catch (err) {
    output = err.stderr || err.stdout;
    console.error(output); // eslint-disable-line no-console
  }
};
