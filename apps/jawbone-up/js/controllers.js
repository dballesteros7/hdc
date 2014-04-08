/**
 * Jawbone Up Connector controllers
 */

var hdcJawboneUp = angular.module('hdcJawboneUp');
hdcJawboneUp.controller('ConnectController', [ '$scope', '$routeParams',
		'$log', '$location', function($scope, $routeParams, $log, $location) {
			var replyTo = $routeParams.replyTo;
			$scope.loading = false;
			$scope.connect = function() {
				$scope.loading = true;
				
				window.open("https://developer.nike.com/", "_blank");
			}
		} ]);