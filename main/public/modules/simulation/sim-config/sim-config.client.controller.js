(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimConfigController', function($scope, Restangular, _, gaToast, gaAppConfig,$log, NgMap) {

      $scope.sim = {};

      NgMap.getMap().then(function(map) {
        var markers = map.markers;
        $scope.sim.lat = markers[0].position.lat();
        $scope.sim.lng = markers[0].position.lng();
      });

    $scope.getCurrentLocation = function(event){
      $scope.sim.lat = event.latLng.lat();
      $scope.sim.lng = event.latLng.lng();
    };

      $scope.tsum1 = 900;
      $scope.tsum2 = 600;
      console.log("Ready for simulation")
    });

}());
