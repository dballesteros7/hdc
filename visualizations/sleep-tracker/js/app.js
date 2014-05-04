var hdcSleepTracker = angular.module('hdcSleepTracker', [ 'ngRoute' ]);

hdcSleepTracker.config([ '$routeProvider', function($routeProvider){
  $routeProvider.when('/:records', {
    templateUrl : 'views/sleeptracker.html',
    controller : 'SleepTrackerCtrl'
  });
} ]);
