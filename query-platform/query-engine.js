var http = require('http');
var express = require('express');

var app = express();
app.enable('strict routing');

exports.app = app;
exports.start = function(){
  app.listen(3001);
};
