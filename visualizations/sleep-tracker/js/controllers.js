var hdcSleepTracker = angular.module('hdcSleepTracker');

hdcSleepTracker.controller('SleepTrackerCtrl', [ '$scope', '$routeParams',
    function($scope, $routeParams){
      var records = JSON.parse(atob($routeParams.records));
      console.log(records);
    } ]);