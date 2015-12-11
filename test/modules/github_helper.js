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
mockery.registerSubstitute('unirest', '../test/mocks/unirest');
mockery.enable({
  warnOnUnregistered: false
});
var githuHelper = require('../../modules/github_helper');

describe('Github Helper Tests', () => {

  it('Gets the PR head repo link', () => {
    return githuHelper.getPullRequestBaseLink('44')
      .then(link => {
        // validation is also done by mock
        assert.ok(link, 'Expected link to not be null');
        // should be pointing to this repo specified by ./tests/assets/githubresponse.json
        assert.equal(link, 'https://raw.githubusercontent.com/sedouard/testtemplate/test_branch_name', 'Expected link: ' + link + ' to contain sedouard/testtemplate');
      });
  });

});
