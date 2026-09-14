/**
 * server/db/client.js
 * Multi-Driver Database Client & Switcher for TernakMart (Pure JavaScript)
 */

try { require('dotenv').config(); } catch (e) {}

const connection = require('./connection');

module.exports = connection;
module.exports.db = connection;
