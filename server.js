// CoastCast v1.0
// A realtime WvW reporting system for Tarnished Coast, using Node.JS and
// Express.JS


// Import Libraries:
var express = require('express');
var exphbs  = require('express-handlebars');


// Express app:
var app = express();


// Template Engine:
app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');


// Routes:
app.get('/', function(req, res) {
  res.render('home', {
        helpers: {
            testText: function() { return 'This is a test!'; }
        }
    });;
});

app.get('/report/:text', function(req, res) {
  res.render('home', {
        helpers: {
            testText: function() { return req.params.text; }
        }
    });;
});


// Start Server:
var server = app.listen(3000, function() {
  // var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://localhost:%s', port);
});
