angular.module('hdcSleepTracker.fitbit', [])
  .factory('fitbit', function(){
    var fitbit = {};
    fitbit.isFitbitSleepRecord = function(record){
      // A fitbit sleep record has a 'sleep' key in the main object.
      if(record.sleep === undefined){
        return false;
      }
      // At least one sleep record must be present in the sleep array
      if(record.sleep.length === undefined || record.sleep.length === 0){
        return false;
      }
      // Record should be good enough otherwise
      return true;
    };
  });