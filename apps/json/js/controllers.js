var textRecordControllers = angular.module('textRecordControllers',
        [ 'ui.bootstrap' ]);

textRecordControllers.controller('CreateCtrl', [
        '$scope',
        '$http',
        '$routeParams',
        function($scope, $http, $routeParams){

            // init
            $scope.errors = {};
            var replyTo = atob($routeParams.replyTo);

            // controller functions
            $scope.validate = function(){
                $scope.loading = true;
                $scope.hasError = false;
                // $scope.validateTitle();
                // $scope.validateData();
                if (!$scope.errors.title && !$scope.errors.data) {
                    $scope.submit();
                }
                $scope.loading = false;
            };

            $scope.validateTitle = function(){
                $scope.errors.title = null;
                if (!$scope.title) {
                    $scope.errors.title = "No title provided";
                } else if ($scope.title.length > 50) {
                    $scope.errors.title = "Title too long.";
                }
            };

            $scope.validateData = function(){
                $scope.errors.data = null;
                if (!$scope.data) {
                    $scope.errors.data = "No data provided.";
                }
            };

            $scope.submit = function(){
                // construct json
                var record = {
                    data : JSON.stringify({
                        provider : $scope.currentProvider,
                        call : $scope.currentCall,
                        data : JSON.parse($scope.data),
                        title : "JSON record",
                    }),
                    name : "JSON record",
                    description : "DAMN THIS IS NEEDED"
                };

                // submit to server
                $http.post(replyTo, record).success(function(){
                    $scope.success = "Record created successfully.";
                    $scope.error = null;
                    $scope.data = null;
                    // $scope.currentProvider = "Select one...";
                    // $scope.currentCall = "Select one...";
                }).error(function(err){
                    $scope.success = null;
                    $scope.error = err.responseText;
                });
            };
		
            // Selection of providers
            $scope.currentProvider = "Select one...";
            $scope.currentCall = "Select one...";
            $scope.providers = [ "Fitbit Flex", "Nike+ Fuelband",
                    "Jawbone UP24", "Jawbone UP" ];
            $scope.displayProvider = function(choice){
                $scope.currentProvider = choice;
                $scope.currentCall = "Select one...";
                if ($scope.currentProvider == "Fitbit Flex") {
                    $scope.calls = [ "Sevgi's calls" ];
                } else if ($scope.currentProvider == "Nike+ Fuelband") {
                    $scope.calls = [ "get_aggregate_sport_data",
                            "list_users_activities",
                            "activities_by_experience_type",
                            "get_activity_detail_for_activity_id",
                            "get_gps_data_for_activity_id" ];
                } else {
                    $scope.calls = [ "Ruifeng's calls" ];
                }
            };
            $scope.displayCall = function(choice){
                $scope.currentCall = choice;
            };
            
        } ]);

             /* ---->>>> Angular JS TreeView needs treedata variable to pass the content */   
            
  


textRecordControllers.controller('DetailsCtrl', [ '$scope', '$routeParams',
        function($scope, $routeParams){

            // init
            $scope.loading = true;

            // parse Base64 encoded JSON record
            $scope.record = JSON.parse(atob($routeParams.record));
            $scope.treedata = $scope.record; 
            $scope.loading = false;
        } ]);
