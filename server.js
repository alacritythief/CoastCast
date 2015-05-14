// CoastCast v1.0 Server
// A realtime WvW reporting system for Tarnished Coast, using Node.JS and
// Express.JS

// LIBRARIES
var express = require('express');
var bodyParser = require('body-parser')


// EXPRESS APP
var app = express();

// Use body-parser for parsing requests:
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TEMPLATE ENGINE - JADE
app.set('views', './views')
app.set('view engine', 'jade');


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


// GLOBAL VARS
app.locals.redbgQueue = [];
app.locals.greenbgQueue = [];
app.locals.bluebgQueue = [];
app.locals.ebgQueue = [];

app.locals.message = null;

// TEST VAR
app.locals.exampleQueue = [];


// ROUTES
app.get('/', function(req, res) {
  console.log(app.locals.exampleQueue);
  console.log("Queue Length: " + app.locals.exampleQueue.length);

  res.render('home', {
        message: app.locals.message,
        reportType: "All Reports",
        reportCount: app.locals.exampleQueue.length > 0 ? app.locals.exampleQueue.length + " Report(s)" : "No Reports",
        reports: app.locals.exampleQueue.tempSwap()
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

    if (app.locals.exampleQueue.length > 9) {
      app.locals.exampleQueue.pop();
    };

    app.locals.exampleQueue.push(report);
    app.locals.message = "Your report has been successfully created!";
    res.status(200).redirect('/');
  } else {
    console.log('Received: BAD Report');
    console.log(req.body);
    app.locals.message = "Please complete all fields.";
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


// SERVER SETTINGS
var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('CoastCast is listening at http://%s:%s', host, port);
});
