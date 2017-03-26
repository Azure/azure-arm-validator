var conf = require('./config');
var Guid = require('guid');
var debug = require('debug')('arm-validator:param_helper');
var assert = require('assert');

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

  parametersString = parametersString.replace(new RegExp(conf.get('SSH_KEY_REPLACE_INDICATOR'), 'g'), conf.get('SSH_PUBLIC_KEY'));
  parametersString = parametersString.replace(new RegExp(conf.get('PASSWORD_REPLACE_INDICATOR'), 'g'), 'ciP$ss' + Guid.raw().replace(/-/g, '').substring(0, 16));
  parametersString = parametersString.replace(new RegExp(conf.get('GUID_REPLACE_INDICATOR'), 'g'), Guid.raw());

  // replace any other environment variables
  matches = parametersString.match(new RegExp(conf.get('ENV_PREFIX_REPLACE_INDICATOR') + '[a-zA-Z0-9]+', 'g'));
  if (matches) {
    matches.forEach(match => {
      var splitPoint = conf.get('ENV_PREFIX_REPLACE_INDICATOR').length;
      var envKeyName = match.substring(splitPoint, match.length);
      var replaceValue = conf.get(envKeyName);
      console.log('replacing: ' + match);
      console.log('with:' + replaceValue);
      parametersString = parametersString.replace(match, replaceValue);
    });
  }

  debug('rendered parameters string: ');
  debug(parametersString);
  return JSON.parse(parametersString);
};
