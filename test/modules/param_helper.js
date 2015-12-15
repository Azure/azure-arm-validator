/*global describe, it*/
/*jshint multistr: true */
var fs = require('fs');
var assert = require('assert');
require('../helpers/setup_env');
var conf = require('../../modules/config');

describe('Paramter Helper Tests', () => {

  it('Should replace ' + conf.get('PARAM_REPLACE_INDICATOR') + ' placeholder with a unqiue 16 character parameter', () => {
    // first read the sample template
    var paramHelper = require('../../modules/param_helper');
    var parameterString = fs.readFileSync('./test/assets/dokku-vm/azuredeploy.parameters.json', {
      encoding: 'utf8'
    }).trim();

    var placeholder = conf.get('PARAM_REPLACE_INDICATOR');
    assert(parameterString.match(new RegExp(placeholder, 'g')).length > 0,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.json \
      Expected ./test/assets/dokku-vm/azuredeploy.parameters.json to have GEN-UNIQUE placeholders');
    var parameters = JSON.parse(parameterString);

    parameters = paramHelper.replaceKeyParameters(parameters);

    assert.equal(parameters.parameters.dnsNameForPublicIP.value.length, 18,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json Expected parameters.parameters.dnsNameForPublicIP.length to be 18.');
    assert.equal(parameters.parameters.newStorageAccountName.value.length, 18,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json Expected parameters.parameters.newStorageAccountName.length to be 18.');
    assert.notEqual(parameters.parameters.dnsNameForPublicIP.value, parameters.parameters.newStorageAccountName.value,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json Expected parameters.parameters.newStorageAccountName and parameters.paramters.dnsNameForPublicIP to not be equal.');

    parameterString = JSON.stringify(parameters);

    assert.equal(parameterString.match(new RegExp(placeholder, 'g')), null, 'In \
      ./test/assets/dokku-vm/azuredeploy.parameters.json \
      Expected all GEN-UNIQUE parameters to be replaced');
  });

  it('Should replace ' + conf.get('PARAM_REPLACE_INDICATOR') + '-[N] placeholder with a unqiue [N] character parameter', () => {
    // first read the sample template
    var paramHelper = require('../../modules/param_helper');
    var parameterString = fs.readFileSync('./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json', {
      encoding: 'utf8'
    }).trim();

    var placeholder = conf.get('PARAM_REPLACE_INDICATOR');

    assert(parameterString.match(new RegExp(placeholder + '-\\d+', 'g')).length > 0,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json \
      Expected ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json to have GEN-UNIQUE placeholders');
    var parameters = JSON.parse(parameterString);

    parameters = paramHelper.replaceKeyParameters(parameters);

    assert.equal(parameters.parameters.dnsNameForPublicIP.value.length, 24,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json Expected parameters.parameters.dnsNameForPublicIP.length to be 24.');
    assert.equal(parameters.parameters.adminUsername.value.length, 8,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json Expected parameters.parameters.adminUsername.length to be 8.');
    assert.equal(parameters.parameters.newStorageAccountName.value.length, 8,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json Expected parameters.parameters.newStorageAccountName.length to be 8.');

    parameterString = JSON.stringify(parameters);

    // check all placeholders are gone
    assert.equal(parameterString.match(new RegExp(placeholder + '-\\d+'), null, 'Expected all ' + placeholder + '-[N] parameters to be replaced'));
  });

  it('Should fail to parse ' + conf.get('PARAM_REPLACE_INDICATOR') + '-[N] placeholders with invalid lengths', () => {
    // first read the sample template
    var paramHelper = require('../../modules/param_helper');
    var parameterString = fs.readFileSync('./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json', {
      encoding: 'utf8'
    }).trim();

    var placeholder = conf.get('PARAM_REPLACE_INDICATOR');

    assert(parameterString.match(new RegExp(placeholder + '-\\d+', 'g')).length > 0,
      'In ./test/assets/dokku-vm/azuredeploy.parameters.gen_unique_var.json \
      Expected to have GEN-UNIQUE placeholders');
    var parameters = JSON.parse(parameterString);
    // inject bad parameter
    parameters.parameters.adminUsername = conf.get('PARAM_REPLACE_INDICATOR') + '-33';

    assert.throws(() => {
      paramHelper.replaceKeyParameters(parameters);
    });
    // inject bad parameter
    parameters.parameters.adminUsername = conf.get('PARAM_REPLACE_INDICATOR') + '-1';

    assert.throws(() => {
      paramHelper.replaceKeyParameters(parameters);
    });

    // inject bad parameter
    parameters.parameters.adminUsername = conf.get('PARAM_REPLACE_INDICATOR') + '-2';

    assert.throws(() => {
      paramHelper.replaceKeyParameters(parameters);
    });

    // inject good parameter
    parameters.parameters.adminUsername = conf.get('PARAM_REPLACE_INDICATOR') + '-12';

    assert.doesNotThrow(() => {
      paramHelper.replaceKeyParameters(parameters);
    });
  });

});
