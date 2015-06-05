// Import Modules

var request = require('superagent');

// Interact with the GW2 API

// GW2_API_KEY = "45FDC179-EA2D-FE48-8857-CD2D74A98BE506E8C283-4AE1-4FD2-9D98-8F80BBC91584";

function grabAccountInfo(key, callback) {
  request
    .get('http://api.guildwars2.com/v2/account')
    .set('Authorization', 'Bearer ' + key)
    .set('Accept', 'application/json')
    .end(function(res){
      callback(res);
    })
};

module.exports = grabAccountInfo;
