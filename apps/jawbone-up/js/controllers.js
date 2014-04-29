/**
 * Jawbone Up Connector controllers
 */

var hdcJawboneUp = angular.module('hdcJawboneUp');

hdcJawboneUp.controller('ConnectCtrl', [ '$scope', '$routeParams', '$log',
		'$location', '$http',
		function($scope, $routeParams, $log, $location, $http) {
			// init
			$scope.loading = false;

			// Controller functions
			$scope.connectToJawboneUp = function() {
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

hdcJawboneUp.controller('ImportCtrl', [ '$scope', '$routeParams', '$log',
		'$location', 'jawboneUpService',
		function($scope, $routeParams, $log, $location, jawboneUpService) {
			var access_token = $routeParams.access_token;

		} ]);