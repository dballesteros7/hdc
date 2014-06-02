
/**
 * Module dependencies.
 */
var express = require('express'),
  favicon = require('serve-favicon'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  routes = require('./routes'),
  fitbit = require('./routes/fitbit'),
  jawbone = require('./routes/jawbone'),
  mongoconn = require('./models/connection'),
  http = require('http'),
  errorhandler = require('errorhandler'),
  path = require('path');


// Define the main app
var app = express();

// Basic configuration for templates
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// Serve the favicon
app.use(favicon(__dirname + '/public/favicon.ico'));
// Enable a development logger of all requests
app.use(logger('dev'));
// Enable the body parser for JSON and URLEncoded requests
app.use(bodyParser());
// Serve all static files in the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable the default error handler when on development mode
var env = process.env.NODE_ENV || 'development';
if('development' == env){
  app.use(errorhandler());
}

// Allow Cross-Origin requests from any place
app.all('*', function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

// Start the server upon successful connection to MongoDB
mongoconn.connect(function(dbconnector){
  // Attach the db object to any request going through
  app.all('*', function(req, res, next){
    req.dbconn = dbconnector;
    next();
  });
  // Enable the endpoint where records can be created programatically
  app.use('/', routes.router)
  // Enable the application-specific routers
  app.use('/fitbit', fitbit.router);
  app.use('/jawbone', jawbone.router);

  // Start the HTTP server
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
});