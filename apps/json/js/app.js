var hdcTextRecords = angular.module('hdcTextRecords', [ 'ngRoute',
        'textRecordControllers', 'angularTreeview']);

hdcTextRecords.config([ '$routeProvider', function($routeProvider){
    $routeProvider.when('/create/:replyTo', {
        templateUrl : 'views/create.html',
        controller : 'CreateCtrl'
    }).when('/details/:record', {
        templateUrl : 'views/details.html',
        controller : 'DetailsCtrl'
    });
} ]);
