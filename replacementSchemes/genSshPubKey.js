var module = require('module')
var conf = require('../modules/config');

var replacementScheme = {'indicator': 'GEN-SSH-PUB_KEY', 'value': conf.get('SSH_PUBLIC_KEY')};

module.exports = {'replacementScheme': replacementScheme}

