
// Use the "esm" package to support modules

require('dotenv').config();
require = require('esm')(module);
module.exports = require('./src/main.js');
