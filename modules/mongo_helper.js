var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    conf = require('./config'),
    denodeify = require('es6-denodeify')(Promise);

var connect = function () {
  // Connection URL
  var url = conf.get('MONGO_CONNECTION_STRING');
  var connectPromise = denodeify(MongoClient.connect);

  return connectPromise.call(MongoClient, url)
         .catch(err => {
           console.error('Failed to conenct to: ' + url);
         });
};

module.exports = {
  connect: connect
};