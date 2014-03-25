/**
 * Nike+ app controllers, this requires the nikeplusModule
 */
var hdcNikePlus = angular.module("hdcNikePlus");

hdcNikePlus.controller("CreateCtrl", [
        "$scope",
        "nikeplus",
        "$routeParams",
        "$log",
        "$location",
        function($scope, nikeplus, $routeParams, $log, $location){
            // init
            var replyTo = $routeParams.replyTo;
            $scope.hideHelp = true;
            $scope.loading = false;
            $scope.error = {
                type : "danger",
                msg : ""
            };

            // Controller functions
            $scope.redirectToToken = function(){
                window.open("https://developer.nike.com/", "_blank");
            };

            $scope.validateAccessToken = function(){
                $scope.loading = true;
                nikeplus.sport($scope.accessToken, function(data, status,
                        headers, config){
                    $log.log(data);
                    $location.path("/authenticated/" + replyTo);
                    $location.search("access_token", $scope.accessToken);
                }, function(){
                    $scope.error.msg = "Invalid token.";
                    $scope.loading = false;
                    $scope.accessToken = "";
                });
            };

            $scope.dismissError = function(){
                $scope.error.msg = "";
            };
        } ]);

hdcNikePlus.controller("DetailsCtrl", [ "$scope", "$routeParams",
        function($scope, $routeParams){

            // init
            $scope.loading = true;

            // parse Base64 encoded JSON record
            $scope.record = JSON.parse(atob($routeParams.record));
            $scope.loading = false;

        } ]);

hdcNikePlus
        .controller(
                "AuthCtrl",
                [
                        "$scope",
                        "$routeParams",
                        "nikeplus",
                        "$location",
                        "$log",
                        function($scope, $routeParams, nikeplus, $location,
                                $log){
                            // init
                            var replyTo = $routeParams.replyTo;
                            var accessToken = $routeParams.access_token;
                            $scope.loading = false;
                            $scope.options = nikeplus.options;
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
                            $scope.returnToCreate = function(){
                                $location.path("/create/" + replyTo);
                                $location.search({});
                            };

                            $scope.importData = function(){
                                var arguments = [ accessToken ];
                                for (var i = 0; i < $scope.selectedOption.arguments.length; i++) {
                                    var argumentValue = $scope.argumentValues[$scope.selectedOption.name][i];
                                    arguments.push(argumentValue);
                                }
                                var successFunc = function(data, status,
                                        headers, config){
                                    $scope.loading = false;
                                    $log.log(data);
                                };
                                var errorFunc = function(data, status, headers,
                                        config){
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