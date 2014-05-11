var hdcSleepTracker = angular.module('hdcSleepTracker');

/**
 * This app supports one type of data: <br>
 * 1. Jawbone UP sleep data <br>
 * 2. Fitbit sleep data <br>
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
 * For an example of a valid Jawbone UP record, see example.json in data/ 
 * <br>
 *
 * For Fitbit, it is expected that every record matches the sleep record for a
 * single day as returned by the following query:
 * 
 * GET /<api-version>/user/<user-id>/sleep/date/<date>.<response-format> <br>
 * 
 * This endpoint is described in: 
 * https://wiki.fitbit.com/display/API/API-Get-Sleep <br>
 * 
 * For an example of a valid record, see example_2.json in data/ <br>
 */
hdcSleepTracker.controller('SleepTrackerCtrl', [
    '$scope',
    '$routeParams',
    'jawbone',
    'fitbit',
    function($scope, $routeParams, jawbone){
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
        //$scope.sleepDayDate = $scope.minDate;
        $scope.$watch('sleepDayDate', function(){
          if($scope.sleepDayDate){
            $scope.sleepDay = $scope
              .sleepMap[$scope.sleepDayDate.toDateString()];
          }
        });
      };

      var records = _.map(JSON.parse(atob($routeParams.records)), JSON.parse);
      var distilledRecords = _.filter(records, jawbone.isJawboneSleepRecord);
      var jawboneRecords = _.filter(records, jawbone.isJawboneSleepRecord);
      var fitbitRecords = _.filter(records, fitbit.isFitbitSleepRecord);

      // Configure the width of the element
      $scope.visWidth = 300;
      $scope.dateWidth = 400;

      // For each of the distilled records, create a clock
      $scope.sleepCollection = _.map(jawboneRecords, jawbone.fromJawboneSleep);
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
      // Create a time series with the sleep quality data
      $scope.sleepQuality = _.map($scope.sleepCollection, function(val){
        return {value : val.quality,
                datetime : val.start_date};
      });
      // Configure the date picker
      $scope.configureDatePicker();
      // Configure the display of the date series
      $scope.dateSeriesShow = true;
      $scope.displayDateSeries = function(){
        $scope.dateSeriesShow = true;
      };
      $scope.showDay = function(point){
        $scope.sleepDay = $scope.sleepMap[point.original.datetime
                                            .toDateString()];
        $scope.dateSeriesShow = false;
      };
    } ]);