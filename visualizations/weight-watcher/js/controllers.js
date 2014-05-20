angular.module('hdcWeightWatcher.controllers', []).controller(
    'WeightWatcherCtrl',
    [
        '$scope',
        '$http',
        '$routeParams',
        function($scope, $http, $routeParams){
          // Initialization
          $scope.userId = $routeParams.records;
          $scope.dataReady = false;
          $scope.displayWeight = 10;
          $scope.displayBmi = 10;
          $scope.fullWeightData = [];

          $scope.periodOptions = [ {
            label : 'Last 5 measurements',
            calculator : function(sortedArray){
              var avgBmi = 0;
              var avgWeight = 0;
              var i = 0;
              for (; i < 5 || i < sortedArray.length; i++) {
                avgWeight += sortedArray[i].weight[0].weight;
                avgBmi += sortedArray[i].weight[0].bmi;
              }
              if (i == 0) {
                $scope.displayWeight = 10;
                $scope.displayBmi = 10;
              } else {
                $scope.displayWeight = avgWeight / i;
                $scope.displayBmi = avgBmi / i;
              }
            }
          }, {
            label : 'Last 3 measurements',
            calculator : function(sortedArray){
              var avgBmi = 0;
              var avgWeight = 0;
              var i = 0;
              for (; i < 3 || i < sortedArray.length; i++) {
                avgWeight += sortedArray[i].weight[0].weight;
                avgBmi += sortedArray[i].weight[0].bmi;
              }
              if (i == 0) {
                $scope.displayWeight = 10;
                $scope.displayBmi = 10;
              } else {
                $scope.displayWeight = avgWeight / i;
                $scope.displayBmi = avgBmi / i;
              }
            }
          }, {
            label : 'Most current',
            calculator : function(sortedArray){
              if (sortedArray.length > 0) {
                $scope.displayWeight = sortedArray[0].weight[0].weight;
                $scope.displayBmi = sortedArray[0].weight[0].bmi;
              } else {
                $scope.displayWeight = 10;
                $scope.displayBmi = 10;
              }
            }
          } ];
          $scope.selectedOption = $scope.periodOptions[0];
          $scope.display = function(){
            $scope.selectedOption.calculator($scope.fullWeightData);
          };
          $scope.messageGenerator = function(){
            if($scope.fullWeightData.length > 0){
              var i = Math.min($scope.fullWeightData.length, 8) - 1;
              var diff = $scope.fullWeightData[0].weight[0].weight - $scope.fullWeightData[i].weight[0].weight;
              if(diff < -0.5){
                $scope.message = 'Congrats! You have dropped ' + (-diff).toFixed(1) + ' kg in the last ' + i + ' days.';
              } else if (diff > 0.5){
                $scope.message = 'Careful there! You have gained ' + diff.toFixed(1) + ' kg in the last ' + i + ' days.';
              } else {
                $scope.message = 'Great job! You have kept your weight stable in the last ' + i + ' days.';
              }
            } else {
              $scope.message = 'We have no data about your weight! :(';
            }
          };
          $http({
            url : '/fitbit/weightlog',
            method : 'GET',
            params : {
              userId : $scope.userId
            }
          }).success(
              function(data){
                $scope.dataReady = true;
                $scope.fullWeightData = _.map(data, function(ele){
                  return JSON.parse(ele.data);
                });
                $scope.fullWeightData = _.sortBy(_.filter(
                    $scope.fullWeightData, function(ele){
                      if (ele.weight.length > 0) {
                        return true;
                      }
                      return false;
                    }), function(ele){
                  return new Date(ele.weight[0].date);
                });
                $scope.fullWeightData.reverse();
                $scope.display();
                $scope.messageGenerator();
              }).error(function(result){
          });
        } ]);