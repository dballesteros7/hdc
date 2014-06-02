/**
 * Define a MongoDB reusable connection.
 */

 var mongodb = require('mongodb');
 var db;

 exports.connect = function(callback){
  if(db === undefined){
    mongodb.MongoClient.connect('mongodb://127.0.0.1:27017/healthdata', function(err, database){
      if(err){
        throw err;
      }
      db = database;
      callback(db);
    });
  } else {
    callback(db);
  }
}