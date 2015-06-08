// CoastCast v1.0 Server
// A realtime WvW reporting system for Tarnished Coast, using Node.JS and
// Express.JS

// Grab settings from .env
require('dotenv').load();

// CORE LIBRARIES
var express = require('express');
var cookieParser = require('cookie-parser')
var csrf = require('csurf');
var bodyParser = require('body-parser');
var stormpath = require('express-stormpath');
var stylus = require('stylus');
var nib = require('nib');

// CUSTOM LIBRARIES
var now = require('./lib/now');
var authInfo = require('./lib/auth');

// EXPRESS APP
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// TEMPLATE ENGINE - JADE
app.set('views', './views');
app.set('view engine', 'jade');

// STYLUS MIDDLEWARE
var compileStylus = function(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
};

app.use(stylus.middleware({src: __dirname + '/public', compile: compileStylus}));
app.use(express.static(__dirname + '/public'));

// Use body-parser for parsing requests:
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use cookie-parser for cookies:
app.use(cookieParser());

// Stormpath for Logins:
app.use(stormpath.init(app, {
    apiKeyFile: '.env',
    application: process.env.APP_URL,
    secretKey: process.env.SECRET_KEY,
    enableUsername: true,
    registrationView: __dirname + '/views/register.jade',
    loginView: __dirname + '/views/login.jade',
    expandCustomData: true,
    enableAutoLogin: true
}));

// CSRF Protection:
csrfProtection = csrf({ sessionKey: 'stormpathSession' });


// PROTOTYPES

// Checks if string is empty
String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

// Non-Destructive Array swap
Array.prototype.tempSwap = function() {
  var results = [];
  for (var i = 0, j = this.length, k; i < j / 2; i += 1) {
    k = j - 1 - i;
    results[i] = this[k];
    results[k] = this[i];
  }
  return results;
};


// GLOBAL VARS
app.locals.redbg = [];
app.locals.greenbg = [];
app.locals.bluebg = [];
app.locals.ebg = [];
app.locals.userCount = 0;


// QUEUE CHECK
function queueCheck() {
  if (app.locals.redbg > 99) {
    app.locals.redbg.pop();
  };

  if (app.locals.greenbg > 99) {
    app.locals.greenbg.pop();
  };

  if (app.locals.bluebg > 99) {
    app.locals.bluebg.pop();
  };

  if (app.locals.ebg > 99) {
    app.locals.ebg.pop();
  };
};


// Total Report Count
function allReportCount() {
  return app.locals.redbg.length + app.locals.greenbg.length + app.locals.bluebg.length + app.locals.ebg.length
};


// Socket.IO
io.on('connection', function(socket){

  // Track when a user connects
  app.locals.userCount += 1;
  io.emit('usercount', 'users connected: ' + app.locals.userCount);

  // Receiving reports
  socket.on('send_report', function(reportValues) {
    now = new Date();

    if (!reportValues['user'].isEmpty() && !reportValues['bg'].isEmpty() && !reportValues['report'].isEmpty()) {
      console.log('Received: GOOD Report');
      console.log(reportValues);

      var report = {
        'rawstamp': now.rawstamp(),
        'user': reportValues['user'],
        'bg': reportValues['bg'],
        'report': reportValues['report'],
        'timestamp': now.timestamp()
      };

      queueCheck();

      if (reportValues['bg'] === 'RED') {
        app.locals.redbg.push(report);
      } else if (reportValues['bg'] === 'GREEN') {
        app.locals.greenbg.push(report);
      } else if (reportValues['bg'] === 'BLUE') {
        app.locals.bluebg.push(report);
      } else if (reportValues['bg'] === 'EBG') {
        app.locals.ebg.push(report);
      };
      io.emit('new_report', report);

    } else {
      console.log('Received: BAD Report');
      console.log(reportValues);
    };

  });

  // Track when a user disconnects
  socket.on('disconnect', function(){
    app.locals.userCount -= 1;
    io.emit('usercount', 'users connected: ' + app.locals.userCount);
  });

});


// ROUTES
app.get('/', function(req, res) {
  res.render('home', {
    user: req.user || null,
    userCount: app.locals.userCount,
    red: app.locals.redbg.tempSwap().slice(0,10),
    green: app.locals.greenbg.tempSwap().slice(0,10),
    blue: app.locals.bluebg.tempSwap().slice(0,10),
    ebg: app.locals.ebg.tempSwap().slice(0,10)
  });
});

app.get('/about', function(req, res) {
  res.render('about', {
    user: req.user || null,
  });
});

app.get('/submit', function(req, res) {
  res.redirect('/');
});

// EXAMPLE POST request:
// curl -d '{"user": "Jim Bob", "bg": "BLUE", "report": "30 BG at spawn tower", "apikey": "xxyyzz"}' -H "Content-Type: application/json" http://127.0.0.1:3000/submit

app.post('/submit', function(req,res) {
  var payload = req.body;
  now = new Date();

  try {
    if (!payload['user'].isEmpty() && !payload['bg'].isEmpty() && !payload['report'].isEmpty() && !payload['apikey'].isEmpty()) {

      authInfo(payload['apikey'], function(error, response) {
        if (response.status === 200) {
          var account = response.body;

          if (account['world'] === 1017) {
            console.log('Received: GOOD Report');
            console.log(req.body);

            var report = {
              'rawstamp': now.rawstamp(),
              'user': payload['user'],
              'bg': payload['bg'],
              'report': payload['report'],
              'timestamp': now.timestamp()
            };

            queueCheck();

            if (payload['bg'] === 'RED') {
              app.locals.redbg.push(report);
            } else if (payload['bg'] === 'GREEN') {
              app.locals.greenbg.push(report);
            } else if (payload['bg'] === 'BLUE') {
              app.locals.bluebg.push(report);
            } else if (payload['bg'] === 'EBG') {
              app.locals.ebg.push(report);
            };

            io.emit('new_report', report);
            res.status(200).send(report);
          } else {
            console.log('NOT ON TC');
            console.log(req.body);
            res.status(500).send('API Key is not on TC');
          };
        } else {
          console.log('BAD API KEY');
          console.log(req.body);
          res.status(500).send('Bad API Key');
        };
      });

    } else {
      console.log('Received: BAD Report');
      console.log(req.body);
      res.status(500).send('Incomplete Report');
    };
  } catch(err) {
    console.log('Received: BAD Report');
    console.log(req.body);
    res.status(500).send('Incomplete Report');
  };
});


// API
app.get('/red/json', function(req, res) {
  res.json(app.locals.redbg.tempSwap());
});

app.get('/green/json', function(req, res) {
  res.json(app.locals.greenbg.tempSwap());
});

app.get('/blue/json', function(req, res) {
  res.json(app.locals.bluebg.tempSwap());
});

app.get('/ebg/json', function(req, res) {
  res.json(app.locals.ebg.tempSwap());
});


// STORMPATH

app.get('/profile', stormpath.loginRequired, csrfProtection, function(req, res) {
  res.render('profile', {
    user: req.user || null,
    apikey: req.user.customData['apikey'] || '',
    verified: req.user.customData['verified'] || null,
    csrfToken: req.csrfToken()
  });
});

app.post('/profile', stormpath.loginRequired, csrfProtection, function(req, res) {
  var payload = req.body;

  // Update User info:
  req.user.givenName = payload['givenName'];
  req.user.surname = payload['surname'];
  req.user.customData['apikey'] = payload['apikey'];
  req.user.customData.save();
  req.user.save(function(error, result) {
    if (!error) {
      console.log(req.user.username + ' updated their profile.');
      res.redirect('/profile/verify');
    } else {
      res.redirect('/profile');
    };
  });
});

app.get('/profile/verify', stormpath.loginRequired, function(req, res) {

  // Query GW2 API and verify the user is on Tarnished Coast:
  authInfo(req.user.customData['apikey'], function(error, response) {
    if (response.status === 200) {
      var account = response.body;

      if (account['world'] === 1017) {
        req.user.customData['verified'] = true;
        req.user.customData.save();
        req.user.save(function(error, result) {
          res.redirect('/profile');
        });
      } else {
        req.user.customData['verified'] = false;
        req.user.customData.save();
        req.user.save(function(error, result) {
          res.redirect('/profile');
        });
      };
    } else {
        req.user.customData['verified'] = false;
        req.user.customData.save();
        req.user.save(function(error, result) {
          res.redirect('/profile');
        });
    };
  });
});


// PING ROUTES (for testing)
// app.get('/ping', function(req, res) {
//   console.log('PING received, GET');
//   res.send('PONG - Method: GET');
// });
//
// app.post('/ping', function(req, res) {
//   console.log('PING received, POST');
//   console.log(req.body);
//   res.send('PONG - Method: POST');
// });


// Error Handling:

app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403);
  res.send('Error - Unauthorized form received.');
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.status(404);
  res.send('Error - 404 - Page not found.');
});

// SERVER SETTINGS

http.listen(3000, function(){
  var host = http.address().address;
  var port = http.address().port;

  console.log('CoastCast is listening at http://%s:%s', host, port);
});
