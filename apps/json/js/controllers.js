var hdcJsonRecords = angular.module('hdcJsonRecords');

hdcJsonRecords.controller('CreateCtrl', [ '$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams){
      // init
      $scope.success = {
        show : false,
        msg : ''
      };
      $scope.error = {
        show : false,
        msg : ''
      };
      var replyTo = atob($routeParams.replyTo);

      // Close alerts on click
      $scope.closeAlert = function(alertVar){
        alertVar.show = false;
      };

      // Clear data
      $scope.clear = function(event){
        $scope.data = null;
        $scope.title = null;
        if(event){
          event.preventDefault();
          event.stopPropagation();
        }
      };

      $scope.submit = function(){
        // construct json
        var record = {
          data : JSON.stringify($scope.data),
          name : $scope.title,
          description : "JSON record manually inputted for testing."
        };

        // submit to server
        $http.post(replyTo, record).success(function(){
          $scope.error.show = false;
          $scope.success.msg = "Record created successfully.";
          $scope.success.show = true;
          $scope.clear();
        }).error(function(err){
          $scope.success.show = false;
          $scope.error.msg = err;
          $scope.error.show = true;
        });
      };
    } ]);

hdcJsonRecords.controller('DetailsCtrl', [
    '$scope',
    '$routeParams',
    function($scope, $routeParams){
      // parse Base64 encoded JSON record
      $scope.record = JSON.stringify(JSON.parse(atob($routeParams.record)),
          undefined, 2);
    } ]);
