var fs = require('fs');
var assert = require('assert');
var targetUrl = '';
exports.get = function (url) {
  assert.ok(url, 'Expected unirest.get url parameter to be non empty string');
  assert(typeof url === 'string', 'Expected unirest.get url parameter to be of type string');
  targetUrl = url;
  return exports;
};
exports.end = function (cb) {
  // the repo Azure/azure-quickstart-templates is specified in .example-config.json
  if (targetUrl === 'https://api.github.com/repos/Azure/azure-quickstart-templates/pulls/44') {
    var jsonString = fs.readFileSync('./test/assets/githubresponse.json', {
      encoding: 'utf8'
    }).trim();
    var jsonData = JSON.parse(jsonString);
    return cb({
      body: jsonData
    });
  }
};
exports.headers = function (headers) {
  assert.ok(headers, 'Expected unirest.headers to be non-null object');
  assert(typeof headers === 'object', 'Expected unirest.headers headers object to be of type object');

  for (var key in headers) {
    if (typeof key === 'string') {
      assert(typeof headers[key] === 'string', 'Expected header value: ' + headers[key] + ' to be of type string');
    } else {
      assert.fail('string', typeof key, 'expected header key: ' + key + ' to be of type string');
    }
  }
  return exports;
};
