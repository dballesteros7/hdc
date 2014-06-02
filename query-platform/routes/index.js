
/*
 * GET home page.
 */

var router = require('express').Router();

router.post('/', function(req, res, next){
  var record = req.body;
  var recordColl = req.dbconn.collection('records');
  recordColl.insert(record, function(err, result){
    if(err) next(err);
    res.send({success: result});
  });
});

exports.router = router;
