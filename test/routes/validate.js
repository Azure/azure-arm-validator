/*global describe, it, beforeEach*/
var request = require('supertest');
var express = require('express');
var RSVP = require('rsvp');
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
mockery.registerSubstitute('unirest', '../test/mocks/unirest');
mockery.enable({
  warnOnUnregistered: false
});
var validate = require('../../routes/validate');
var bodyParser = require('body-parser');

function setupRequestBody() {
  var templateString = fs.readFileSync('./test/assets/dokku-vm/azuredeploy.json', {
    encoding: 'utf8'
  }).trim();
  var templateObject = JSON.parse(templateString);
  var parametersString = fs.readFileSync('./test/assets/dokku-vm/azuredeploy.parameters.json', {
    encoding: 'utf8'
  }).trim();
  var parametersObject = JSON.parse(parametersString);
  var requestBody = {
    template: templateObject,
    parameters: parametersObject,
    pull_request: 44
  };

  return requestBody;
}
describe('Validate Route Tests', () => {
  var app;
  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/', validate);
  });

  it('Validates the Template', () => {

    var requestBody = setupRequestBody();

    return new RSVP.Promise((resolve, reject) => {
      request(app)
        .post('/validate')
        .send(requestBody)
        .expect(200)
        .end((err, res) => {
          if (err) {
            assert.fail(null, err, 'Unexpected error ' + err);
            return reject(err);
          }
          assert.equal(res.body.result, 'Template Valid');
          return resolve(res.body);
        });
    });

  });

  it('Deploys the Template', () => {

    var requestBody = setupRequestBody();

    return new RSVP.Promise((resolve, reject) => {
      request(app)
        .post('/deploy')
        .send(requestBody)
        .expect(202)
        .end((err, res) => {
          if (err) {
            assert.fail(null, err, 'Unexpected error ' + err);
            return reject(err);
          }

          if (res.body.result !== 'Deployment Successful') {
            return reject(res.body.result);
          }

          assert.equal(res.body.result, 'Deployment Successful');
          return resolve(res.body);
        });
    });

  });
});
