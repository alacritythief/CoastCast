// GW2 API TOOLS

// Import Modules
var request = require('superagent');

// Interact with the GW2 API
// World 1017 is Tarnished Coast

// Example use:
// authInfo('xxxyyyzzz', function(err, res) {
//   console.log(res.body);
// });

function authInfo(key, callback) {
  request
    .get('http://api.guildwars2.com/v2/account')
    .set('Authorization', 'Bearer ' + key)
    .set('Accept', 'application/json')
    .end(callback);
}

module.exports = authInfo;
