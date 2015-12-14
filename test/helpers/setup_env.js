// helper to inject fake conifugration settings to environment
var fs = require('fs');
var configString = fs.readFileSync('./.example-config.json', {
  encoding: 'utf8'
}).trim();
var configData = JSON.parse(configString);

for (var key in configData) {
  if (typeof key === 'string') {
    process.env[key] = configData[key];
  }
}
