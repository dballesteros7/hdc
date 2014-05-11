angular.module('hdcSleepTracker.jawbone', []).factory(
    'jawbone',
    function(){
      var jawboneService = {};
      jawboneService.isJawboneSleepRecord = function(record){
        // A jawbone record should have a meta property, and a data property
        // with items
        if (record.meta === undefined || record.data === undefined
            || record.data.items === undefined) {
          return false;
        }
        // If there are no items in the data element then ignore this element
        if (record.data.items.length == 0) {
          return false;
        }
        // Now we are going to deal with sleeping records, first make sure that
        // for every item we have an xid and an associated sleep phases object
        // in the main element. Additionally check that every element has a
        // details object and at least the following properties
        // asleep_time, awake_time, sunset, sunrise, quality
        if (!_.every(record.data.items, function(childElem){
          if (childElem.xid === undefined
              || record[childElem.xid] === undefined) {
            return false;
          }
          if (childElem.details === undefined
              || childElem.details.asleep_time === undefined
              || childElem.details.awake_time === undefined
              || childElem.details.sunset === undefined
              || childElem.details.sunrise === undefined
              || childElem.details.quality === undefined) {
            return false;
          }
          return true;
        })) {
          return false;
        }
        return true;
      };
      return jawboneService;
    });