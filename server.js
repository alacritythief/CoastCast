// CoastCast v1.0
// A realtime WvW reporting system for Tarnished Coast, using Node.JS and
// Express.JS


// Import Libraries:
var express = require('express');
var exphbs  = require('express-handlebars');


// Express app:
var app = express();


// Template Engine:
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');


// Prototypes:
Date.prototype.addzero = function(num) {
  return (num >= 0 && num < 10) ? "0" + num : num + "";
};

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


// Global vars:
app.locals.redbgQueue = [];
app.locals.greenbgQueue = [];
app.locals.bluebgQueue = [];
app.locals.ebgQueue = [];
app.locals.exampleQueue = [];


// Routes:
app.get('/', function(req, res) {
  res.render('home', {
        helpers: {
            testText: function() { return 'This is a test!'; }
        }
    });;
});

app.get('/report/:payload', function(req, res) {
  res.render('home', {
        helpers: {
            testText: function() { return req.params.payload; }
        }
    });;
});

app.get('/test', function(req, res) {
  now = new Date();

  var report = {
    'rawstamp': now.rawstamp(),
    'user': 'Ryvalia',
    'report': '30 BG outside of Bay',
    'time': now.timestamp()
  };

  if (app.locals.exampleQueue.length > 9) {
    app.locals.exampleQueue.pop();
  };

  app.locals.exampleQueue.push(report);

  console.log(app.locals.exampleQueue);
  console.log("queue length: " + app.locals.exampleQueue.length);

  res.render('report', {
        reports: app.locals.exampleQueue.reverse()
    });;
});


// Start Server:
var server = app.listen(3000, function() {
  // var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://localhost:%s', port);
});
