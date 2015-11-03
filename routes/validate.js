var express = require('express'),
    router = express.Router(),
    azureTools = require('../modules/azure'),
    Guid = require('guid'),
    fs = require('fs'),
    RSVP = require('rsvp');
var debug = require('debug')('arm-validator:server');
router.post('/', function(req, res, next) {

  var fileName = Guid.raw(),
      parametersFileName = Guid.raw(),
      writeFile = RSVP.denodeify(fs.writeFile);

  writeFile.call(fs, fileName, JSON.stringify(req.body.template, null, '\t'))
  .then(function () {
    return writeFile.call(fs, parametersFileName, JSON.stringify(req.body.parameters, null, '\t'));
  })
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

module.exports = router;
