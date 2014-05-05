var hdcSleepTracker = angular.module('hdcSleepTracker');

/**
 * This app supports one type of data: <br>
 * 1. Jawbone UP sleep data <br>
 * 
 * For Jawbone UP, it is expected that every record matches the sleep list for a
 * single day with details about the phases of the sleep events. The main object
 * is the result of the following query: <br>
 * 
 * https://jawbone.com/nudge/api/v.1.1/users/@me/sleeps?date= <br>
 * 
 * This object is described in:
 * https://jawbone.com/up/developer/endpoints/sleeps<br>
 * 
 * If the result of this query has any items in data.items, then for each one of
 * them there must be an extra property in the data object containing the ticks
 * as provided by: https://jawbone.com/nudge/api/v.1.1/sleeps/{sleep_xid}/ticks,
 * for this property the key should be the sleep_xid. <br>
 * 
 * For an example of a valid record, check the example.json in data/ <br>
 */
hdcSleepTracker.controller('SleepTrackerCtrl', [
    '$scope',
    '$routeParams',
    function($scope, $routeParams){
      /**
       * Function that transforms a timestamps in seconds to the corresponding
       * hour in the day in 24 hour format with decimal accounting for the
       * minutes.
       */
      $scope.toHours = function(timestamp){
        var tmpDate = new Date(timestamp * 1000);
        return tmpDate.getHours() + tmpDate.getMinutes() / 60;
      };
      /**
       * Function that maps from Jawbone UP int codes for sleep depth to the
       * corresponding CSS class for the sleep-cycle directive from the
       * visualizations library.
       */
      $scope.getUPColor = function(depth){
        switch (depth) {
        case 1:
          return 'awake';
        case 2:
          return 'light-sleep';
        case 3:
          return 'deep-sleep';
        }
      };
      /**
       * Function that maps from the Jawbone UP sleep to a string description of
       * the sleep status at that point.
       */
      $scope.getUPDescription = function(depth){
        switch (depth) {
        case 1:
          return 'Awake';
        case 2:
          return 'Light sleep';
        case 3:
          return 'Sound sleep';
        }
      };
      /**
       * Function to configure the date picker
       */
      $scope.configureDatePicker = function(){
        $scope.minDate = $scope.sleepCollection[0].start_date;
        $scope.maxDate = $scope
          .sleepCollection[$scope.sleepCollection.length - 1].start_date;
        $scope.datePickerOpened = false;
        $scope.openDatePicker = function($event){
          $event.preventDefault();
          $event.stopPropagation();
          $scope.datePickerOpened = true;
        };
        $scope.disableDate = function(newDate, mode){
          if(mode == 'day' && newDate){
            return !$scope.sleepMap[newDate.toDateString()];
          }
        };
        $scope.sleepDayDate = $scope.minDate;
        $scope.$watch('sleepDayDate', function(){
          if($scope.sleepDayDate){
            $scope.sleepDay = $scope
              .sleepMap[$scope.sleepDayDate.toDateString()];
          }
        });
      };

      var records = _.map(JSON.parse(atob($routeParams.records)), JSON.parse);
      var distilledRecords = _.filter(records, function(elem){
        // First check that this is a jawbone UP record
        // A jawbone record should have a meta property, and a data property
        // with items
        if (elem.meta === undefined || elem.data === undefined
            || elem.data.items === undefined) {
          return false;
        }
        // If there are no items in the data element then ignore this element
        if (elem.data.items.length == 0) {
          return false;
        }
        // Now we are going to deal with sleeping records, first make sure that
        // for every item we have an xid and an associated sleep phases object
        // in the main element. Additionally check that every element has a
        // details object and at least the following properties
        // asleep_time, awake_time, sunset, sunrise, quality
        if (!_.every(elem.data.items,
            function(childElem){
              if (childElem.xid === undefined
                  || elem[childElem.xid] === undefined) {
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
      });
      // Configure the width of the element
      $scope.visWidth = 300;
      // For each of the distilled records, create a clock
      $scope.sleepCollection = _.map(distilledRecords, function(elem){
        var item = new Object();
        item.sunset = $scope.toHours(elem.data.items[0].details.sunset);
        item.sunrise = $scope.toHours(elem.data.items[0].details.sunrise);
        item.start_date = new Date(elem.data.items[0].time_created * 1000);
        item.end_date = new Date(
            elem.data.items[elem.data.items.length - 1].time_completed * 1000);
        item.quality = _.max(elem.data.items, function(val){
          return parseInt(val.details.quality);
        }).details.quality;
        item.data = [];
        elem.data.items.forEach(function(val){
          var absoluteEnd = val.time_completed;
          var lastObject = null;
          var ticks = elem[val.xid].data.items;
          ticks.forEach(function(tick){
            if (lastObject) {
              lastObject.endTime = new Date(tick.time * 1000);
            }
            var newEvent = null;
            newEvent = {
              startTime : new Date(tick.time * 1000),
              colorClass : $scope.getUPColor(tick.depth),
              description : $scope.getUPDescription(tick.depth)
            };
            lastObject = newEvent;
            item.data.push(lastObject);
          });
          lastObject.endTime = new Date(absoluteEnd * 1000);
        });
        return item;
      });
      // Ensure that clocks are ordered by date
      $scope.sleepCollection = _.sortBy($scope.sleepCollection, function(val){
        return val.start_date;
      });
      // Map the sleep collection to an object where the property keys are the
      // dates
      $scope.sleepMap = {};
      $scope.sleepCollection.forEach(function(val){
        $scope.sleepMap[val.start_date.toDateString()] = val;
      });
      // Configure the date picker
      $scope.configureDatePicker();
    } ]);