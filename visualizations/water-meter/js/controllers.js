var app = angular.module('hdcWaterMeter');

app.controller('WaterMeterCtrl', [
    '$scope',
    '$routeParams',
    function($scope, $routeParams){
      $scope.tmp = [{"value": 96, "datetime": "2010-01-01"}, {"value": 78, "datetime": "2010-01-31"}, {"value": 53, "datetime": "2010-03-02"}, {"value": 91, "datetime": "2010-04-01"}, {"value": 30, "datetime": "2010-05-01"}, {"value": 64, "datetime": "2010-05-31"}, {"value": 6, "datetime": "2010-06-30"}, {"value": 30, "datetime": "2010-07-30"}, {"value": 1, "datetime": "2010-08-29"}, {"value": 60, "datetime": "2010-09-28"}, {"value": 93, "datetime": "2010-10-28"}, {"value": 95, "datetime": "2010-11-27"}, {"value": 3, "datetime": "2010-12-27"}, {"value": 46, "datetime": "2011-01-26"}, {"value": 87, "datetime": "2011-02-25"}, {"value": 26, "datetime": "2011-03-27"}, {"value": 42, "datetime": "2011-04-26"}, {"value": 7, "datetime": "2011-05-26"}, {"value": 55, "datetime": "2011-06-25"}, {"value": 6, "datetime": "2011-07-25"}, {"value": 8, "datetime": "2011-08-24"}, {"value": 77, "datetime": "2011-09-23"}, {"value": 16, "datetime": "2011-10-23"}, {"value": 60, "datetime": "2011-11-22"}, {"value": 51, "datetime": "2011-12-22"}, {"value": 75, "datetime": "2012-01-21"}, {"value": 50, "datetime": "2012-02-20"}, {"value": 40, "datetime": "2012-03-21"}, {"value": 68, "datetime": "2012-04-20"}, {"value": 77, "datetime": "2012-05-20"}, {"value": 45, "datetime": "2012-06-19"}, {"value": 44, "datetime": "2012-07-19"}, {"value": 37, "datetime": "2012-08-18"}, {"value": 55, "datetime": "2012-09-17"}, {"value": 21, "datetime": "2012-10-17"}, {"value": 56, "datetime": "2012-11-16"}, {"value": 83, "datetime": "2012-12-16"}, {"value": 45, "datetime": "2013-01-15"}, {"value": 82, "datetime": "2013-02-14"}, {"value": 23, "datetime": "2013-03-16"}, {"value": 6, "datetime": "2013-04-15"}, {"value": 23, "datetime": "2013-05-15"}, {"value": 29, "datetime": "2013-06-14"}, {"value": 78, "datetime": "2013-07-14"}, {"value": 55, "datetime": "2013-08-13"}, {"value": 72, "datetime": "2013-09-12"}, {"value": 61, "datetime": "2013-10-12"}, {"value": 30, "datetime": "2013-11-11"}];
      $scope.tmp.forEach(function(element){
        element.datetime = new Date(element.datetime);
      });
      $scope.data = $scope.tmp;
    } ]);
