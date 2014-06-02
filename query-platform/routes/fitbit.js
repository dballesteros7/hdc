/**
 *
 **/

var router = require('express').Router();
var objectId = require('mongodb').ObjectID;

router.get('/1/user/-/body/log/weight/date/:startdate/:enddate.json', function(req, res, next){
  var userId = objectId(req.params.user);
  var startDate = new Date(req.params.startdate);
  var endDate = new Date(req.params.enddate);
  var recordColl = req.dbconn.collection('records');
  recordColl.find({created: {$gte: startDate, $lte: endDate},
                   type: 'weight-data'}).toArray(function(err, docs){
    if(err) next(err);
    res.send(docs);
  });
});

exports.router = router;