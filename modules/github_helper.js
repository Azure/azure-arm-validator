var unirest = require('unirest');
var path = require('path');
var conf = require('./config');
var RSVP = require('rsvp');

exports.getPullRequestBaseLink = function (prNumber) {

  return new RSVP.Promise((resolve, reject) => {
    unirest.get('https://' + path.join('api.github.com/repos/', conf.get('GITHUB_REPO'), '/pulls/', prNumber.toString()))
      .headers({
        'User-Agent': 'Mozilla/5.0'
      })
      .end(response => {

        if (response.error) {
          return reject(response.error);
        }

        return resolve(response.body);
      });
  })
  .then(body => {
    return 'https://' + path.join('raw.githubusercontent.com', body.head.repo.full_name, body.head.ref);
  });
};
