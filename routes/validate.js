var express = require('express'),
    router = express.Router(),
    azureTools = require('../modules/azure'),
    Guid = require('guid'),
    fs = require('fs'),
    conf = require('../modules/config');
    RSVP = require('rsvp'),
    DelayedResponse = require('http-delayed-response');

var debug = require('debug')('arm-validator:server');

function writeFileHelper (fs, fileName, parametersFileName, template, parameters) {
  var writeFile = RSVP.denodeify(fs.writeFile);
  return writeFile.call(fs, fileName, JSON.stringify(template, null, '\t'))
  .then(function () {
    return writeFile.call(fs, parametersFileName, JSON.stringify(parameters, null, '\t'));
  })
}
router.post('/validate', function(req, res, next) {

  var fileName = Guid.raw(),
      parametersFileName = Guid.raw();
      

  writeFileHelper(fs, fileName, parametersFileName, req.body.template, req.body.parameters)
  .then(function () {
    debug('wrote: ');
    debug(JSON.stringify(req.body.template, null, '\t'));
    debug('file: ' + fileName);
    debug(azureTools.validateTemplate);
    return azureTools.validateTemplate(fileName, parametersFileName);
  })
  .then(function () {
    return res.send({result: 'Template Valid'});
  })
  .catch(function (err) {
    return res.status(400).send({error: err.toString()});
  })
  .finally(function () {
    fs.unlink(fileName);
    fs.unlink(parametersFileName);
  });
});

router.post('/deploy', function (req, res, next) {
  var fileName = Guid.raw(),
      rgName = conf.get('RESOURCE_GROUP_NAME_PREFIX') + Guid.raw(),
      parametersFileName = Guid.raw();

  var delayed = new DelayedResponse(req, res);
  // shortcut for res.setHeader('Content-Type', 'application/json') 
  delayed.json();
  // start activates long-polling - headers must be set before 
  for (var key in req.body.parameters.parameters) {
    // for unique parameters replace with a guid
    if (req.body.parameters.parameters[key].value === conf.get('PARAM_REPLACE_INDICATOR')) {
      req.body.parameters.parameters[key].value = 'citest' + Guid.raw().replace(/-/g,'').substring(0, 16);
    }
  }
  var responseHandler = delayed.start();
  writeFileHelper(fs, fileName, parametersFileName, req.body.template, req.body.parameters)
  .then(function () {
    debug('deploying template: ');
    debug(JSON.stringify(req.body.template, null, '\t'));
    debug('with paremeters: ');
    debug(JSON.stringify(req.body.parameters, null, '\t'))
    return azureTools.testTemplate(fileName, parametersFileName, rgName);
  })
  .then(function () {
    debug('Deployment Successful');
    // stop sending long poll bytes
    delayed.stop();
    return res.end(JSON.stringify({result: 'Deployment Successful'}));
  })
  .catch(function (err) {
    debug(err);
    debug('Deployment not Sucessful');
    // stop sending long poll bytes
    delayed.stop();
    return res.end(JSON.stringify({error: err.toString(), 
      _rgName: rgName, 
      command: 'azure group deployment create --resource-group (your_group_name) --template-file azuredeploy.json --parameters-file azuredeploy.parameters.json'
      })
    );
  })
  .finally(function () {
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
