var module = require('module')
var Guid = require('guid');

var conf = require('../modules/config');


var replacementScheme = {'indicator': 'PASSWORD_REPLACE_INDICATOR', 'value': 'ciP$ss' + Guid.raw().replace(/-/g, '').substring(0, 16)};

module.exports = {'replacementScheme': replacementScheme}
