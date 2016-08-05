var Guid = require('guid');

module.exports = {'indicator': 'GEN-PASSWORD', 'value': 'ciP$ss' + Guid.raw().replace(/-/g, '').substring(0, 16)};
