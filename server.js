// CoastCast v1.0 Server
// A realtime WvW reporting system for Tarnished Coast, using Node.JS and
// Express.JS

// Grab settings from .env
require('dotenv').load();

// LIBRARIES
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var stylus = require('stylus');
var nib = require('nib');
var paginate = require('paginate');
var flash = require('connect-flash');
var uuid = require('node-uuid');

// EXPRESS APP
var app = express();

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

// Use cookie-parser to utilize cookies, add sessions:
app.use(cookieParser());
app.use(session({
  genid: function(req) {
    return uuid.v4();
  },
  store: new FileStore(),
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true
}));

// CSRF protection:
app.use(csrf({ cookie: false }));

// Use connect-flash for flash messages:
app.use(flash());


// PROTOTYPES

// Converts single digits to double digits
Date.prototype.addzero = function(num) {
  return (num >= 0 && num < 10) ? "0" + num : num + "";
};

// Converts 24hr format to 12hr format
Date.prototype.standardHours = function() {
  var hours = this.getHours();
  if (hours > 12) {
      hours -= 12;
  } else if (hours === 0) {
     hours = 12;
  };
  return hours;
};

// Creates a MM/DD/YYYY HH:MM:SS timestamp
Date.prototype.timestamp = function() {
  return [
    [this.addzero(this.getMonth() + 1),
    this.addzero(this.getDate()),
    this.getFullYear()].join("/"),
    [this.addzero(this.standardHours()), this.addzero(this.getMinutes()),
    this.addzero(this.getSeconds())].join(":"),
    now.getHours() >= 12 ? "PM" : "AM"
  ].join(" ");
};

// Creates a raw YYYYMMDDHHMMSS timestamp
Date.prototype.rawstamp = function() {
  return [
    [this.getFullYear(),
    this.addzero(this.getMonth() + 1),
    this.addzero(this.getDate())
    ].join(""),
    [this.addzero(this.getHours()), this.addzero(this.getMinutes()),
    this.addzero(this.getSeconds())].join("")
  ].join("");
};

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

  var pagination = paginate.page(this.length, 20, num);
  return pagination;
};


// GLOBAL VARS
app.locals.redbg = [];
app.locals.greenbg = [];
app.locals.bluebg = [];
app.locals.ebg = [];

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


// TEST VAR
app.locals.exampleQueue = [];


// ROUTES
app.get('/', function(req, res) {
  console.log(app.locals.exampleQueue);
  console.log("Queue Length: " + app.locals.exampleQueue.length);

  res.render('home', {
        csrfToken: req.csrfToken(),
        message: req.flash('message'),
        reportType: "All Reports",
        reportCount: allReportCount() > 0 ? allReportCount() + " Report(s)" : "No Reports",
        red: app.locals.redbg.tempSwap(),
        green: app.locals.greenbg.tempSwap(),
        blue: app.locals.bluebg.tempSwap(),
        ebg: app.locals.ebg.tempSwap()
    });
});

app.get('/json', function(req, res) {
  res.json(app.locals.exampleQueue.tempSwap());
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

    if (payload['bg'] === 'RED') {
      app.locals.redbg.push(report);
    } else if (payload['bg'] === 'GREEN') {
      app.locals.greenbg.push(report);
    } else if (payload['bg'] === 'BLUE') {
      app.locals.bluebg.push(report);
    } else if (payload['bg'] === 'EBG') {
      app.locals.ebg.push(report);
    };

    req.flash("message", "<div class='message-green'>Your report has been successfully created!</div>");
    res.status(200).redirect('/');
  } else {
    console.log('Received: BAD Report');
    console.log(req.body);
    req.flash("message", "<div class='message-red'>Please complete all fields.</div>");
    res.status(500).redirect('/');
  };
});


// EXAMPLE POST request:
// curl -d '{"user": "Jim Bob", "bg": "BLUE", "report": "30 BG at spawn tower"}' -H "Content-Type: application/json" http://127.0.0.1:3000/test

// PING ROUTES (for testing)
app.get('/ping', function(req, res) {
  console.log('PING received, GET');
  res.send('PONG - Method: GET');
});

app.post('/ping', function(req, res) {
  console.log('PING received, POST');
  console.log(req.body);
  res.send('PONG - Method: POST');
});


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
var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('CoastCast is listening at http://%s:%s', host, port);
});
