/**
 * Jawbone Up Connector app. The module configuration defines a route provider
 * that controls the single-page application which has the following views: <br>
 * 1. connect.html: This is the entry point where the user can issue the command
 * to connect his/her account with his/her Jawbone Up account.
 * 
 */

angular.module("hdcJawboneUp", [ "ngRoute", "ui.bootstrap" ]).config(
		[ '$routeProvider', function($routeProvider) {
			$routeProvider.when('/connect/:replyTo', {
				templateUrl : 'views/connect.html',
				controller : 'ConnectCtrl'
			}).when('/connected/:replyTo', {
				templateUrl : 'views/connected.html',
				controller : 'ConnectedCtrl'
			});
		} ]);
