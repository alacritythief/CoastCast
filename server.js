// Server Listner


// Import things:
var express = require('express');
var exphbs  = require('express-handlebars');


// Express app:
var app = express();
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
  res.send('Report: ' + req.params.text);
});


// Start server:
var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
