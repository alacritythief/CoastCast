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
var uuid = require('node-uuid');

// CUSTOM LIBRARIES
var now = require('./lib/date');
var grabAccountInfo = require('./lib/auth');

// EXPRESS APP
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var csrfProtection = csrf({ cookie: true })

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
    application: 'https://api.stormpath.com/v1/applications/6TwQZZ2ICTrkDrhFAXD7eA',
    secretKey: process.env.SECRET_KEY,
    enableUsername: true,
    registrationView: __dirname + '/views/register.jade',
    loginView: __dirname + '/views/login.jade',
    expandCustomData: true,
    enableAutoLogin: true
}));


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

// Array Pagination
Array.prototype.page = function(num) {
  if (num <= 0) {
    num = 1;
  } else {
    num = num || 1;
  };

  var pagination = paginate.page(this.length, 10, num);
  return pagination;
};


// GLOBAL VARS
app.locals.redbg = [];
app.locals.greenbg = [];
app.locals.bluebg = [];
app.locals.ebg = [];
app.locals.userCount = 0;

// Queue Check
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


app.get('/submit', function(req, res) {
  res.redirect('/');
});

app.post('/submit', function(req,res) {
  var payload = req.body;
  now = new Date();

  console.log("Payload:");
  console.log(payload);

  if (!payload['user'].isEmpty() && !payload['bg'].isEmpty() && !payload['report'].isEmpty()) {
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

    req.session['last_bg'] = payload['bg'];

    if (payload['bg'] === 'RED') {
      app.locals.redbg.push(report);
    } else if (payload['bg'] === 'GREEN') {
      app.locals.greenbg.push(report);
    } else if (payload['bg'] === 'BLUE') {
      app.locals.bluebg.push(report);
    } else if (payload['bg'] === 'EBG') {
      app.locals.ebg.push(report);
    };

    res.status(200).send(report);
  } else {
    console.log('Received: BAD Report');
    console.log(req.body);
    res.status(500);
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


// Stormpath testing

app.get('/email', stormpath.loginRequired, function(req, res) {
  res.send('Your email address is: ' + req.user.email);
});

app.get('/user', stormpath.loginRequired, function(req, res) {
  res.send(req.user);
});

app.get('/profile', stormpath.loginRequired, csrfProtection, function(req, res) {
  console.log('GET');

  console.log(req.user.customData['apikey']);

  res.render('profile', {
    user: req.user || null,
    apikey: req.user.customData['apikey'] || null,
    verified: req.user.customData['verified'] || null,
    csrfToken: req.csrfToken()
  });
});

app.post('/profile', stormpath.loginRequired, csrfProtection, function(req, res) {

  console.log('POST');

  var payload = req.body;

  // Update User info:
  req.user.givenName = payload['givenName'];
  req.user.surname = payload['surname'];
  req.user.customData['apikey'] = payload['apikey'];
  console.log('changing to ' + req.user.customData['apikey']);
  // req.user.save();
  req.user.customData.save();

  console.log('changed to ' + req.user.customData['apikey']);

  res.redirect('/verify');
});

app.get('/verify', stormpath.loginRequired, function(req, res) {

  console.log('verify: ' + req.user.customData['apikey']);

  grabAccountInfo(req.user.customData['apikey'], function(err, res) {
    console.log(err.error || res.body);

    if (res.ok) {
      var account = res.body;

      console.log(account.world);

      if (account['world'] === 1017) {
        req.user.customData['verified'] = 'true';
        req.user.customData.save();
      } else {
        delete req.user.customData['verified'];
        req.user.save();
        req.user.customData.save();
      };

    } else {

      if (req.user.customData['verified']) {

        delete req.user.customData['verified'];
        req.user.save();
        req.user.customData.save();

      };

    };
  });

  res.redirect('/profile');
});



// EXAMPLE POST request:
// curl -d '{"user": "Jim Bob", "bg": "BLUE", "report": "30 BG at spawn tower"}' -H "Content-Type: application/json" http://127.0.0.1:3000/submit

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
