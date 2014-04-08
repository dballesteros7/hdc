/**
 * Jawbone Up Connector controllers
 */

var hdcJawboneUp = angular.module('hdcJawboneUp');

hdcJawboneUp.controller('ConnectController', [ '$scope', '$routeParams',
		'$log', '$location', '$http',
		function($scope, $routeParams, $log, $location, $http) {
			// init
			var replyTo = $routeParams.replyTo;
			$scope.loading = false;

			// Controller functions
			$scope.connect = function() {
				$scope.loading = true;
				$http({
					method : 'GET',
					url : '/authorize/jawboneUp',
					params : {
						'reply_to' : replyTo
					}
				}).success(function(data, status, headers, config) {
					window.location.assign(data.redirect_to);
				}).error(function(data, status, headers, config) {
					$scope.loading = false;
				})

			}
		} ]);