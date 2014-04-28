var app = angular.module('hdcWaterMeter', [ 'ngRoute' ]);

app.config([ '$routeProvider', function($routeProvider){
  $routeProvider.when('/:records', {
    templateUrl : 'views/watermeter.html',
    controller : 'WaterMeterCtrl'
  });
} ]);
