var MongoClient = require('mongodb').MongoClient,
  conf = require('./config'),
  denodeify = require('es6-denodeify')(Promise);

var connect = function () {
  // Connection URL
  var url = conf.get('MONGO_URL');
  var connectPromise = denodeify(MongoClient.connect);

  return connectPromise.call(MongoClient, url)
    .catch(err => {
      console.error('Failed to conenct to: ' + url);
      console.error(err);
    });
};

module.exports = {
  connect: connect
};
