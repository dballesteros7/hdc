angular.module('hdcWeightWatcher', [ 'ngRoute', 'weightscale', 'hdcWeightWatcher.controllers' ]).config(
    [ '$routeProvider', function($routeProvider){
      $routeProvider.when('/:records', {
        templateUrl : 'views/weightwatcher.html',
        controller : 'WeightWatcherCtrl'
      });
    } ]);