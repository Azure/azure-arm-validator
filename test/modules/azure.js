/*global describe, it*/
var fs = require('fs');
var assert = require('assert');
var configString = fs.readFileSync('./.example-config.json', {
  encoding: 'utf8'
}).trim();
var configData = JSON.parse(configString);

for (var key in configData) {
  if (typeof key === 'string') {
    process.env[key] = configData[key];
  }
}

var mockery = require('mockery');
mockery.registerSubstitute('azure-scripty', '../test/mocks/azure');
mockery.registerSubstitute('mongodb', '../test/mocks/mongodb');
mockery.enable({
  warnOnUnregistered: false
});
var azureTools = require('../../modules/azure');

describe('Azure Tools Tests', () => {

  it('logs in', () => {
    return azureTools.login()
      .then(() => {
        // validation is done by mock
        assert.ok(true);
      });
  });

  it('Validates Template', () => {
    return azureTools.validateTemplate('./test/assets/dokku-vm/azuredeploy.json',
        './test/assets/dokku-vm/azuredeploy.parameters.json')
      .then(() => {
        // validation is done by mock
        assert.ok(true);
      });
  });

  it('Deletes a group', () => {
    return azureTools.deleteGroup('testgroupname')
      .then(() => {
        // validation is done by mock
        assert.ok(true);
      });
  });

  it('It deploys a template', () => {
    return azureTools.testTemplate('./test/assets/dokku-vm/azuredeploy.json',
        './test/assets/dokku-vm/azuredeploy.parameters.json', 'testgroupname')
      .then(() => {
        // validation is done by mock
        assert.ok(true);
      });
  });

});
