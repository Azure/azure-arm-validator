var module = require('module')
var conf = require('../modules/config');

var replacementScheme = {'indicator': 'SSH_KEY_REPLACE_INDICATOR', 'value': conf.get('SSH_PUBLIC_KEY')};

module.exports = {'replacementScheme': replacementScheme}

