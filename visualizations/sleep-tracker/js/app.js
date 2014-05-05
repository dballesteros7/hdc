var hdcSleepTracker = angular.module('hdcSleepTracker', [ 'ngRoute',
    'sleepcycle', 'ui.bootstrap' ]);

hdcSleepTracker.config([ '$routeProvider', function($routeProvider){
  $routeProvider.when('/:records', {
    templateUrl : 'views/sleeptracker.html',
    controller : 'SleepTrackerCtrl'
  });
} ]);