var conf = require('./config');
var Guid = require('guid');
var debug = require('debug')('arm-validator:param_helper');
var assert = require('assert');
var fs = require('fs');

var replacementSchemesDir = conf.get('PATH_TO_ROOT') + '/' + 'replacementSchemes/';

exports.replaceKeyParameters = function (parameters) {
  var parametersString = JSON.stringify(parameters);
  // for unique parameters replace each with a guid
  var matches = parametersString.match(new RegExp(conf.get('PARAM_REPLACE_INDICATOR') + '-\\d+', 'g'));
  if (matches) {
    matches.forEach(match => {
      var splitPoint = match.indexOf('-', conf.get('PARAM_REPLACE_INDICATOR').length);
      var length = parseInt(match.substring(splitPoint + 1, match.length));
      assert(typeof length === 'number', 'Variable length unique params must be appened by an integer');
      assert(length >= 3 && length <= 32, 'Variable length unique params must specify a length between 3 and 32');
      var replaceValue = 'ci' + Guid.raw().replace(/-/g, '').substring(0, length - 2);
      debug('replacing: ' + match);
      debug('with:' + replaceValue);
      parametersString = parametersString.replace(match, replaceValue);
    });
  }

  matches = parametersString.match(new RegExp(conf.get('PARAM_REPLACE_INDICATOR'), 'g'));
  if (matches) {
    matches.forEach(match => {
      parametersString = parametersString.replace(match, 'ci' + Guid.raw().replace(/-/g, '').substring(0, 16));
    });
  }

  // do all other replacement; don't do GEN_UNIQUE here because
  // the truncated and non-trucated versions need to happen in the right order,
  // which we don't enforce in this loop
  var replacementSchemeFiles = fs.readdirSync(replacementSchemesDir);
  for (var i = 0; i < replacementSchemeFiles.length; i = i + 1) {
    var replacementScheme = require(replacementSchemesDir + replacementSchemeFiles[i]);
    parametersString = parametersString.replace(replacementScheme.indicator, replacementScheme.value);
  }

  debug('rendered parameters string: ');
  debug(parametersString);
  return JSON.parse(parametersString);
};

