// Retrieve the connection pool manager from dbconnection
var mongodconnect = require('../dbconnection.js');
var ObjectID = require('mongodb').ObjectID;
var _ = require('underscore');

// Define the queries made available by this server
exports.weightLog = function(userId, callback){
  mongodconnect.connect(function(err, connection){
    if (err !== null) {
      callback(err);
    } else {
      connection.collection('records', {
        'strict' : true
      }, function(err, recordCollection){
        if (err !== null) {
          callback(err);
        } else {
          recordCollection.find({
            owner : ObjectID(userId)
          }).toArray(function(err, documents){
            if (err !== null) {
              callback(err);
            } else {
              callback(null, _.filter(documents, function(val){
                var innerData = JSON.parse(val.data);
                if(innerData.type && innerData.type.localeCompare('fitbit-weight-log') === 0){
                  return true;
                } else {
                  return false;
                }
              }));
            }
          });
        }
      });
    }
  });
};
