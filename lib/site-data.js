const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'site.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function readPublicData() {
  const { admin, ...publicData } = readData();
  return publicData;
}

module.exports = { readData, readPublicData, DATA_FILE };
