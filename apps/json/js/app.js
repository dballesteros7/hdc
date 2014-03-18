var hdcJsonRecords = angular.module('hdcJsonRecords', [ 'ngRoute',
    'ui.bootstrap' ]);

hdcJsonRecords.config([ '$routeProvider', function($routeProvider){
  $routeProvider.when('/create/:replyTo', {
    templateUrl : 'views/create.html',
    controller : 'CreateCtrl'
  }).when('/details/:record', {
    templateUrl : 'views/details.html',
    controller : 'DetailsCtrl'
  });
} ]);

hdcJsonRecords.directive('json', function(){
  return {
    require : 'ngModel',
    link : function(scope, element, attr, ctrl){
      ctrl.$parsers.push(function(viewValue){
        try {
          var parsedJson = JSON.parse(viewValue);
          ctrl.$setValidity('json', true);
          return parsedJson;
        } catch (ex) {
          ctrl.$setValidity('json', false);
          return undefined;
        }
      });
    }
  };
});
