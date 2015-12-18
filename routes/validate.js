var express = require('express'),
  router = express.Router(),
  path = require('path'),
  azureTools = require('../modules/azure'),
  paramHelper = require('../modules/param_helper'),
  Guid = require('guid'),
  fs = require('fs'),
  conf = require('../modules/config'),
  RSVP = require('rsvp'),
  githubHelper = require('../modules/github_helper'),
  DelayedResponse = require('http-delayed-response');

var debug = require('debug')('arm-validator:server');
var parallelDeployLimit = parseInt(conf.get('PARALLEL_DEPLOY_LIMIT') || 20);
debug('parallelDeployLimit: ' + parallelDeployLimit);
var parallelDeploys = 0;

function writeFileHelper(fs, fileName, parametersFileName, template, parameters) {
  var writeFile = RSVP.denodeify(fs.writeFile);
  return writeFile.call(fs, fileName, JSON.stringify(template, null, '\t'))
    .then(function () {
      return writeFile.call(fs, parametersFileName, JSON.stringify(parameters, null, '\t'));
    });
}

// replaces https://raw.githubusercontent.com links to upstream:master to the downstream repo
function replaceRawLinksForPR(template, prNumber) {
  var templateString = JSON.stringify(template);
  // we make the assumption all links target a source on master
  var replaceTarget = 'https://' + path.join('raw.githubusercontent.com/', conf.get('GITHUB_REPO'), '/master');
  debug('replaceTarget: ' + replaceTarget);
  return githubHelper.getPullRequestBaseLink(prNumber)
    .then(link => {
      // replace something like 'https://raw.githubusercontent.com/azure/azure-quickstart-templates/master'
      // with 'https://raw.githubusercontent.com/user/azure-quickstart-templates/sourcebranch'
      return JSON.parse(templateString.replace(new RegExp(replaceTarget, 'g'), link));
    });
}

// replaces
function replaceSpecialParameterPlaceholders(req) {
  req.body.parameters = paramHelper.replaceKeyParameters(req.body.parameters);
}
router.post('/validate', function (req, res) {

  var fileName = Guid.raw(),
    parametersFileName = Guid.raw();

  replaceSpecialParameterPlaceholders(req);

  writeFileHelper(fs, fileName, parametersFileName, req.body.template, req.body.parameters)
    .then(function () {
      debug('wrote: ');
      debug(JSON.stringify(req.body.template, null, '\t'));
      debug('file: ' + fileName);
      return azureTools.validateTemplate(fileName, parametersFileName);
    })
    .then(function () {
      return res.send({
        result: 'Template Valid'
      });
    })
    .catch(function (err) {
      return res.status(400).send({
        error: err.toString()
      });
    })
    .finally(function () {
      fs.unlink(fileName);
      fs.unlink(parametersFileName);
    });
});

router.post('/deploy', function (req, res) {

  var fileName = Guid.raw(),
    rgName = conf.get('RESOURCE_GROUP_NAME_PREFIX') + Guid.raw(),
    parametersFileName = Guid.raw();

  if (parallelDeploys >= parallelDeployLimit) {
    return res.status(403).send({
      error: 'Server has hit its parallel deployment limit. Try again later'
    });
  }

  var delayed = new DelayedResponse(req, res);
  // shortcut for res.setHeader('Content-Type', 'application/json')
  delayed.json();
  replaceSpecialParameterPlaceholders(req);
  delayed.start();
  var promise = new RSVP.Promise((resolve) => {
    resolve();
  });

  debug('pull request number: ' + req.body.pull_request);
  if (req.body.pull_request) {
    promise = promise
      .then(() => {
        return replaceRawLinksForPR(req.body.template, req.body.pull_request);
      })
      .then((modifiedTemplate) => {
        debug('modified template is:');
        debug(modifiedTemplate);
        req.body.template = modifiedTemplate;
      });
  }

  promise.then(() => {
    return writeFileHelper(fs, fileName, parametersFileName, req.body.template, req.body.parameters);
  })
  .then(function () {
    debug('deploying template: ');
    debug(JSON.stringify(req.body.template, null, '\t'));
    debug('with paremeters: ');
    debug(JSON.stringify(req.body.parameters, null, '\t'));
    parallelDeploys += 1;
    debug('parallel deploy count: ' + parallelDeploys);
    return azureTools.testTemplate(fileName, parametersFileName, rgName);
  })
  .then(function () {
    debug('Deployment Successful');
    // stop sending long poll bytes
    delayed.stop();
    return res.end(JSON.stringify({
      result: 'Deployment Successful'
    }));
  })
  .catch(function (err) {
    debug(err);
    debug('Deployment not Sucessful');
    // stop sending long poll bytes
    delayed.stop();
    return res.end(JSON.stringify({
      error: err.toString(),
      _rgName: rgName,
      command: 'azure group deployment create --resource-group (your_group_name) --template-file azuredeploy.json --parameters-file azuredeploy.parameters.json',
      parameters: JSON.stringify(req.body.parameters),
      template: JSON.stringify(req.body.template)
    }));
  })
  .finally(function () {
    parallelDeploys -= 1;
    fs.unlink(fileName);
    fs.unlink(parametersFileName);

    azureTools.deleteGroup(rgName)
      .then(() => {
        debug('Sucessfully cleaned up resource group: ' + rgName);
      })
      .catch((err) => {
        console.error('failed to delete resource group: ' + rgName);
        console.error(err);
      });
  });
});

module.exports = router;
