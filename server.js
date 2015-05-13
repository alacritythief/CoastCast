// CoastCast v1.0
// A realtime WvW reporting system for Tarnished Coast, using Node.JS and
// Express.JS

// LIBRARIES
var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser')


// EXPRESS APP
var app = express();

// Use JSON for parsing requests:
app.use(bodyParser.json())

// TEMPLATE ENGINE
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');


// PROTOTYPES

// Converts single digits to double digits
Date.prototype.addzero = function(num) {
  return (num >= 0 && num < 10) ? "0" + num : num + "";
};

// Creates a MM/DD/YYYY HH:MM:SS timestamp
Date.prototype.timestamp = function() {
  return [
    [this.addzero(this.getMonth() + 1),
    this.addzero(this.getDate()),
    this.getFullYear()].join("/"),
    [this.addzero(this.getHours()), this.addzero(this.getMinutes()),
    this.addzero(this.getSeconds())].join(":"),
    now.getHours() >= 12 ? "PM" : "AM"
  ].join(" ");
};

// Creates a  raw YYYYMMDDHHMMSS timestamp
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


// GLOVAL VARS
app.locals.redbgQueue = [];
app.locals.greenbgQueue = [];
app.locals.bluebgQueue = [];
app.locals.ebgQueue = [];

// TEST VAR
app.locals.exampleQueue = [];


// ROUTES
app.get('/', function(req, res) {
  res.render('home', {
        helpers: {
            testText: function() { return 'This is CoastCast!'; }
        }
    });
});

app.get('/report/:payload', function(req, res) {
  res.render('home', {
        helpers: {
            testText: function() { return 'PARAMS: ' + req.params.payload; }
        }
    });
});


// EXAMPLE POST request:
// curl -d '{"user": "Jim Bob", "report": "30 BG at spawn tower"}' -H "Content-Type: application/json" http://127.0.0.1:3000/test


// TEST REPORT ROUTES
app.get('/test', function(req, res) {
  console.log(app.locals.exampleQueue);
  console.log("Queue Length: " + app.locals.exampleQueue.length);

  res.render('report', {
        title: app.locals.exampleQueue.length > 0 ? app.locals.exampleQueue.length + " Reports" : "No Reports",
        reports:  app.locals.exampleQueue.reverse()
    });
});

app.post('/test', function(req,res) {
  var payload = req.body;
  now = new Date();

  if ("user" in payload === true && "report" in payload === true) {
    console.log('Received: GOOD Report');
    console.log(req.body);

    var report = {
      'rawstamp': now.rawstamp(),
      'user': payload['user'],
      'report': payload['report'],
      'time': now.timestamp()
    };

    if (app.locals.exampleQueue.length > 9) {
      app.locals.exampleQueue.pop();
    };

    app.locals.exampleQueue.push(report);
    res.status(200).send('RESPONSE: 200');
  } else {
    console.log('Received: BAD Report');
    console.log(req.body);
    res.status(500).send('RESPONSE: 500');
  };
});


// PING ROUTES (for testing)
app.get('/ping', function(req, res) {
  console.log('PING received, GET');
  res.send('PONG - Method: GET');
});

app.post('/ping', function(req, res) {
  console.log('PING received, POST');
  res.send('PONG - Method: POST');
});


// START THE SERVER LOOP
var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('CoastCast is listening at http://%s:%s', host, port);
});
