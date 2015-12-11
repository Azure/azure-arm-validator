var assert = require('assert');
var Db = function () {

};
var Collection = function () {

};
var MongoClient = function () {

};
Collection.prototype.insert = function (object, cb) {
  assert(typeof object === 'object', 'Expected collection.insert.object parameter 1 to be of type object');
  return cb(null, {
    ops: {
      length: 1
    }
  });
};
Collection.prototype.deleteOne = function (object, cb) {
  assert(typeof object === 'object', 'Expected collection.insert.object parameter 1 to be of type object');
  return cb(null, {
    ops: {
      length: 1
    }
  });
};
Db.prototype.collection = function (collectionName) {
  assert.ok(collectionName, 'Expected collectionName parameter for db.collection to be non-empty string');
  assert(typeof collectionName === 'string', 'Expected collectionName parameter for db.collection to be a string');
  return new Collection();
};
MongoClient.prototype.connect = function (url, cb) {
  assert.ok(url, 'Expected url parameter for MongoClient.connect to be non-empty string');
  assert(typeof url === 'string', 'Expected url parameter for MongoClient.connect to be a string');
  cb(null, new Db());
};

exports.MongoClient = new MongoClient();
