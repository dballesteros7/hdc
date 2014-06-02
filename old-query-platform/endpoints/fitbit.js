// Each endpoint module can be accompanied with a queries module that interacts
// with mongodb.
// e.g. var queries = require('../queries/fitbit.js');
var queries = require('../queries/fitbit.js');

// The attach interface allows this module to add endpoints to the app.
// e.g. exports.attach = function(app){
// app.get('/fitbit/', function(req, res) {res.send('Hello World');});
// }
// It is expected that each module prefixes the route with the associated
// product name to avoid conflict, e.g. /fitbit/weightlog
exports.attach = function(app){
  app.get('/fitbit/weightlog', function(req, res){
    var userId = req.query.userId;
    queries.weightLog(userId, function(err, weightRecords){
      if (err !== null) {
        res.json(500, {
          message : err
        });
      } else {
        res.json(200, weightRecords);
      }
    });
  });
};
