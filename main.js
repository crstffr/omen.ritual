
// Use the "esm" package to support modules

require = require('esm')(module);
module.exports = require('./src/main.js');
