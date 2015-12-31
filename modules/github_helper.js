var unirest = require('unirest');
var path = require('path');
var conf = require('./config');
var RSVP = require('rsvp');
var debug = require('debug')('arm-validator:github');

exports.getPullRequestBaseLink = function (prNumber) {

  return new RSVP.Promise((resolve, reject) => {
    var githubPath = 'https://' + path.join('api.github.com/repos/', conf.get('GITHUB_REPO'), '/pulls/', prNumber.toString());
    githubPath += '?client_id=' + conf.get('GITHUB_CLIENT_ID') + '&client_secret=' + conf.get('GITHUB_CLIENT_SECRET');
    debug('making github request: GET - ' + githubPath);
    unirest.get(githubPath)
      .headers({
        'User-Agent': 'Mozilla/5.0'
      })
      .end(response => {

        if (response.error) {
          return reject(response.error);
        }
        debug('Rate Limit Remaining: ' + response.headers['x-ratelimit-remaining']);
        return resolve(response.body);
      });
  })
  .then(body => {
    return 'https://' + path.join('raw.githubusercontent.com', body.head.repo.full_name, body.head.ref);
  });
};
