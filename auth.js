// Import Modules

var request = require('superagent');

// Interact with the GW2 API
function grabAccountInfo(key, callback) {
  request
    .get('http://api.guildwars2.com/v2/account')
    .set('Authorization', 'Bearer ' + key)
    .set('Accept', 'application/json')
    .end(callback)
};

module.exports = grabAccountInfo;
