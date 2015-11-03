var scripty = require('azure-scripty'),
    conf = require('./config'),
    RSVP = require('rsvp');
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
  console.log('DEBUG: using template file:');
  console.log(templateFile);
  console.log('using paramters:');
  console.log(parametersFile);
  return invoke.call(scripty, cmd);
}

