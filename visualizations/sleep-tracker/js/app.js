var hdcSleepTracker = angular.module('hdcSleepTracker', [ 'ngRoute',
    'sleepcycle' ]);

hdcSleepTracker.config([ '$routeProvider', function($routeProvider){
  $routeProvider.when('/:records', {
    templateUrl : 'views/sleeptracker.html',
    controller : 'SleepTrackerCtrl'
  });
} ]);
