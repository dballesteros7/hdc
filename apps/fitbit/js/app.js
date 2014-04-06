/**
 * HDC Nike+ plugin app The module configuration defines a route provider that
 * controls the single-page application which has the following views: <br>
 * 1. create.html: This is the entry point for the record creation and provides
 * a login screen for the user. <br>
 * 2. authenticated.html: This view is displayed after the user has provided a
 * valid access token that can be used to import his data from Nike+. <br>
 * 3. details: This view displays a stored Nike+ record.
 */
angular.module("hdcFitbit", [ "ngRoute", "ui.bootstrap" ]).config(
        [ '$routeProvider', function($routeProvider){
            $routeProvider.when('/create/:replyTo', {
                templateUrl : 'views/create.html',
                controller : 'CreateCtrl'
            }).when('/authenticated/:replyTo', {
                templateUrl : 'views/authenticated.html',
                controller : 'AuthCtrl'
            }).when('/details/:record', {
                templateUrl : 'views/details.html',
                controller : 'DetailsCtrl'
            });
        } ]);
