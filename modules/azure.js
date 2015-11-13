var scripty = require('azure-scripty'),
    conf = require('./config'),
    RSVP = require('rsvp'),
    Guid = require('guid'),
    debug = require('debug')('arm-validator:azure'),
    mongoHelper = require('./mongo_helper');

var invoke = RSVP.denodeify(scripty.invoke);
  
exports.login = function () {
  var cmd = {
        command: 'login --service-principal',
        'username': conf.get('AZURE_CLIENT_ID'),
        'password': conf.get('AZURE_CLIENT_SECRET'),
        'tenant': conf.get('AZURE_TENANT_ID')
      },
      arm = {
        command: 'config mode arm'
      };
  return invoke.call(scripty, cmd)
  .then(invoke.call(scripty, arm));
}

exports.validateTemplate = function (templateFile, parametersFile) {
  var cmd = {
    command: 'group template validate',
    'resource-group': conf.get('TEST_RESOURCE_GROUP_NAME'),
    'template-file': templateFile,
    'parameters-file': parametersFile
  }
  debug('DEBUG: using template file:');
  debug(templateFile);
  debug('using paramters:');
  debug(parametersFile);
  return invoke.call(scripty, cmd);
}

function createGroup (groupName) {
  debug('creating resource group: ' + groupName + ' in region ' + conf.get('AZURE_REGION'));
  var cmd = {
    command: 'group create ',
    positional: [groupName, conf.get('AZURE_REGION')]
  }
  return invoke.call(scripty, cmd);
}

exports.deleteExistingGroups = function () {
  return mongoHelper.connect()
  .then(db => {
    var resourceGroups = db.collection('resourceGroups');
    var find = RSVP.denodeify(resourceGroups.find);
    return find.call(resourceGroups, {});
  })
  .then(results => {
    var promises = [];
    results.forEach(result => {
      var promise = exports.deleteGroup(result.name)
      promises.push(promise);
    });

    return RSVP.all(promises);
  });
}

exports.deleteGroup = function (groupName) {
  var cmd = {
    command: 'group delete',
    quiet: '',
    positional: [groupName]
  }
  // first, remove tracking entry in db
  return mongoHelper.connect()
  .then(db => {
    debug('deleting resource group: ' + groupName);
    var resourceGroups = db.collection('resourceGroups');
    var deleteOne = RSVP.denodeify(resourceGroups.deleteOne);
    return deleteOne.call(resourceGroups, { name: groupName})
  })
  .then(result => invoke.call(scripty, cmd))
  .then(() => debug('sucessfully deleted resource group: ' + groupName))
  .catch(err => {
    debug('failed to delete resource group: ' + groupName);
    console.error(err.stack);
  })
}

exports.testTemplate = function (templateFile, parametersFile, rgName) {
  debug('DEBUG: using template file:');
  debug(templateFile);
  debug('using paramters:');
  debug(parametersFile);
  debug('Deploying to RG: ' + rgName);

  return mongoHelper.connect()
  .then(db => {
    var resourceGroups = db.collection('resourceGroups');
    var insert = RSVP.denodeify(resourceGroups.insert);
    return insert.call(resourceGroups, {
      name: rgName,
      region: rgName
    });
  })
  .then(result => {
    debug('sucessfully inserted ' + result.ops.length + ' resource group to collection');
    return createGroup(rgName);
  })
  .then(() => {
    debug('sucessfully created resource group ' + rgName);

    var cmd = {
      command: 'group deployment create',
      'resource-group': rgName,
      'template-file': templateFile,
      'parameters-file': parametersFile
    };
    // now deploy!
    return invoke.call(scripty, cmd);
  });
}
