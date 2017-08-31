(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimConfigController', function($scope, Restangular, _, gaToast, gaAppConfig,$log, NgMap) {

      $scope.sim = {};
      $scope.simulation = Restangular.one('simulations');
      Restangular.one('simulations').get().then(function(simulation) {
        $scope.simulation = simulation;
        console.log(simulation);
      });


      NgMap.getMap().then(function(map) {
        var markers = map.markers;
        $scope.sim.lat = markers[0].position.lat();
        $scope.sim.lng = markers[0].position.lng();
      });

    $scope.getCurrentLocation = function(event){
      $scope.sim.lat = event.latLng.lat();
      $scope.sim.lng = event.latLng.lng();
    };

      // Default values
      $scope.sim.name = 'sim001';
      $scope.sim.description = 'Dummy simulation';
      $scope.sim.crop_name = 'wheat';
      $scope.sim.sowing_date = new Date(2014, 10, 1);
      $scope.sim.max_sowing_date = new Date(2015, 12, 1);
      $scope.sim.end_date = new Date(2015, 7, 1);
      $scope.sim.max_end_date = new Date(2015,12,31);
      $scope.sim.tsum1 = 900;
      $scope.sim.tsum2 = 600;
      $scope.sim.soil = {};

      // Soil variables
      $scope.sim.soil.SMW = 30.0;
      $scope.sim.soil.SMFCF = 46.0;
      $scope.sim.soil.SM0 = 57.0;
      $scope.sim.soil.CRAIRC = 5.0;
      $scope.sim.soil.RDMSOL = 120;

      $scope.sim.soil.SM = 45.0;

      console.log("Ready for simulation");

      $scope.run_simulation = function() {
        gaToast.show('The simulation is running in the background...');
          $scope.simulation.save().then(function() {
              _.extend(gaAppConfig, $scope.simulation);
              console.log($scope.simulation);
              gaToast.show('Simulation configuration was successfully saved.');
              $scope.simConfigForm.$setPristine();
          });
      };
    });



}());
