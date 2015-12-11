var assert = require('assert');
var fs = require('fs');

exports.invoke = function (cmd, cb) {
  switch (cmd.command) {
    case 'login --service-principal':
      assert.ok(cmd.command, 'Expected command.username to be a non-empty string');
      assert(typeof cmd.username === 'string', 'Expected command.username to be a string');
      assert.ok(cmd.password, 'Expected command.password to be a non-empty string');
      assert(typeof cmd.password === 'string', 'Expected command.password to be a string');
      assert.ok(cmd.tenant, 'Expected command.tenant to be a non-empty string');
      assert(typeof cmd.tenant === 'string', 'Expected command.tenant to be a string');
      break;
    case 'config mode arm':
      break;
    case 'group deployment create':
    case 'group template validate':
      assert.ok(cmd['resource-group'], 'Expected command.resource-group to be a non-empty string');
      assert(fs.existsSync(cmd['template-file']), 'Expected command.template-file to point to an existing file path');
      assert.ok(cmd['parameters-file'], 'Expected command.parameters-file to be a non-empty string');
      assert(typeof cmd['parameters-file'] === 'string', 'Expected command.parameters-file to be a string');
      assert(fs.existsSync(cmd['parameters-file']), 'Expected command.parameters-file to point to an existing file path');
      break;
    case 'group create':
      assert.equal(cmd.positional.length, 2, 'Expected group create command to have 2 parameters');
      assert.ok(typeof cmd.positional[0], 'Expected group create command paramter 1 to be string');
      assert.equal(typeof cmd.positional[0], 'string', 'Expected group create command paramter 1 to be string');
      assert.ok(typeof cmd.positional[1], 'Expected group create command paramter 2 to be string');
      assert.equal(typeof cmd.positional[1], 'string', 'Expected group create command paramter 2 to be string');
      break;
    case 'group delete':
      assert.equal(cmd.positional.length, 1, 'Expected group delete command to have 1 parameters');
      assert.ok(typeof cmd.positional[0], 'Expected group delete command paramter 1 to be string');
      assert.equal(typeof cmd.positional[0], 'string', 'Expected group delete command paramter 1 to be string');
      break;
    default:
      throw 'Mock Azure cli interface doesnt have an implementation for command: ' + cmd.command + ' please create one';
  }
  // execute callback
  return cb(null);
};
