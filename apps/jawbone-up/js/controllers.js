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
					url : '/authorize/jawbone-up'
				}).success(function(data, status, headers, config) {
					window.location.assign(data.redirect_to);
				}).error(function(data, status, headers, config) {
					$scope.loading = false;
				})

			}
		} ]);

hdcJawboneUp.controller('ConnectedController', [ '$scope', '$routeParams',
		'$log', '$location', '$http',
		function($scope, $routeParams, $log, $location, $http) {
			// TODO: finish the controller here
		} ]);