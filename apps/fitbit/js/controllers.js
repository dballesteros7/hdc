/**
 * Nike+ app controllers, this requires the nikeplusModule
 */
var hdcFitbit = angular.module("hdcFitbit");

hdcFitbit.controller("CreateCtrl", [ "$scope", "$routeParams", "$log",
		"$location", "$http",
		function($scope, $routeParams, $log, $location, $http) {
			// init
			var replyTo = $routeParams.replyTo;
			$scope.loading = false;
			$scope.error = {
				type : "danger",
				msg : ""
			};

			// Controller functions
			$scope.startLoginFlow = function() {
				$loading = true;
				$http({
					method : "GET",
					url : "/connect/fitbit",
					params : {
						"reply_to" : replyTo
					}
				}).success(function(data, status, headers, config) {
					window.location.assign(data.redirect_to);
				}).error(function(data, status, headers, config) {
					$loading = false;
					$scope.error.msg = data;
				});
			};
			$scope.dismissError = function() {
				$scope.error.msg = "";
			};
		} ]);

hdcFitbit.controller("DetailsCtrl", [
		"$scope",
		"$routeParams",
		"$http",
		function($scope, $routeParams, $http) {
			// init
			$scope.loading = true;
			$scope.data = {
				_type : 'date_histogram'
			};
			$http({
				url : "/load",
				method : "GET"
			}).success(
					function(data, status, headers, config) {
						$scope.loading = false;
						$scope.dataType = Object.keys(data)[0];
						var dataArray = data[$scope.dataType];
						$scope.data.entries = new Array();
						for (var i = 0; i < dataArray.length; i++) {
							var date_millis = new Date(dataArray[i].dateTime)
									.getTime();
							var value = parseFloat(dataArray[i].value);
							$scope.data.entries.push({
								time : date_millis,
								count : value
							});
						}
					});
		} ]);

hdcFitbit
		.controller(
				"AuthCtrl",
				[
						"$scope",
						"$routeParams",
						"fitbit",
						"$location",
						"$log",
						"$http",
						function($scope, $routeParams, fitbit, $location, $log,
								$http) {
							// init
							var replyTo = $routeParams.replyTo;
							var oauth_token = $routeParams.oauth_token;
							var oauth_token_secret = $routeParams.oauth_token_secret;
							var consumer_key = '7f7d7e289dbd4cf890f02990cb2b527c';
							var consumer_secret = '91a5adb0ad1546a3844cda09738445d0';
							var oauth_objects = {
								oauth_token : oauth_token,
								oauth_token_secret : oauth_token_secret,
								consumer_key : consumer_key,
								consumer_secret : consumer_secret
							};
							$scope.loading = false;
							$scope.options = fitbit.options;
							$scope.selectedOption = $scope.options[0];
							$scope.argumentValues = {};
							$scope.error = {
								type : "danger",
								msg : ""
							};
							for (var i = 0; i < $scope.options.length; i++) {
								$scope.argumentValues[$scope.options[i].name] = new Array();
							}

							// Controller functions
							$scope.importData = function() {
								var arguments = new Array();
								arguments.push(oauth_objects);
								for (var i = 0; i < $scope.selectedOption.arguments.length; i++) {
									var argumentValue = $scope.argumentValues[$scope.selectedOption.name][i];
									if (argumentValue.value) {
										argumentValue = argumentValue.value;
									}
									arguments.push(argumentValue);
								}
								var successFunc = function(data, status,
										headers, config) {
									$scope.loading = false;
									$http({
										url : '/store',
										method : 'POST',
										data : data,
									});
								};
								var errorFunc = function(data, status, headers,
										config) {
									$scope.loading = false;
									$scope.error.msg = data;
								};
								$scope.loading = true;
								arguments.push(successFunc);
								arguments.push(errorFunc);
								$scope.selectedOption.apiCall.apply(this,
										arguments);
							};
						} ]);