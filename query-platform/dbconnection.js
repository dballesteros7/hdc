var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

var mongoclient = new MongoClient(new Server('localhost', 27017), {
  native_parser : true
});
var db = null;

/**
 * Connection pool initialization, this opens a connection to the MongoDB server
 * and caches it as a connection pool. If the connection is already available
 * then it is passed as the second argument to callback, otherwise it will be
 * passed asynchronously when the connection is opened by the driver. If an
 * error occurs then the connection will be null and an error will be passed as
 * the first argument to the callback.
 */
exports.connect = function(callback){
  if (db === null) {
    mongoclient.open(function(err, resultconn){
      if (err !== null) {
        callback(err);
      } else {
        db = resultconn.db('healthdata');
        // On close, make sure to delete the connection
        db.on('close', function(err, result){
          db = null;
        });
        callback(null, db);
      }
    });
  } else {
    callback(null, db);
  }
};
