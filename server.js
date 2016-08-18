var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.use(express.static('public'));
app.use('/jquery', express.static(__dirname + '/jquery-ui-1.11.4.custom'));

var port = process.env.PORT || 8080;

var jsonParser = bodyParser.json();

app.get('/', function(request, response) {
   response.render('index.html'); 
});

app.listen(port);