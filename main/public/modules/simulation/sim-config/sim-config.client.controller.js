(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimConfigController', function($scope, Restangular, _, gaToast, gaAppConfig,$log) {
      $scope.tsum1 = 900;
      $scope.tsum2 = 600;
      console.log("Ready for simulation")
    });

}());
