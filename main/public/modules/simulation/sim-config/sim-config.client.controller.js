(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimConfigController', function($scope, Restangular, _, gaToast, gaAppConfig,$log, NgMap) {

      $scope.sim = Restangular.restangularizeElement(null, {name: 'Test demo'}, 'simulations');

      Restangular.one('simulations/new').get().then(function(simulation_defaults) {
        $scope.sim = simulation_defaults;
        $scope.sim.route = 'simulations';
        console.log('Sim with defaults: ', $scope.sim);
      });


      $scope.getCurrentLocation = function(event){
        $scope.sim.location.lat = event.latLng.lat();
        $scope.sim.location.lon = event.latLng.lng();
      };

      NgMap.getMap().then(function(map) {
        var markers = map.markers;

      });

      /*
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
      $scope.sim.soil_attributes = {};

      // Soil variables
      $scope.sim.soil_attributes.SMW = 30.0;
      $scope.sim.soil_attributes.SMFCF = 46.0;
      $scope.sim.soil_attributes.SM0 = 57.0;
      $scope.sim.soil_attributes.CRAIRC = 5.0;
      $scope.sim.soil_attributes.RDMSOL = 120;

      $scope.sim.soil_attributes.SM = 45.0;
      */

      $scope.soil_attributes = $scope.sim.soil_attributes;

      console.log("Ready for simulation");

      $scope.run_simulation = function() {
        gaToast.show('The simulation is running in the background...');
          $scope.sim.save().then(function() {
              _.extend(gaAppConfig, $scope.sim);
              console.log($scope.sim);
              gaToast.show('Simulation configuration was successfully saved.');
              $scope.simConfigForm.$setPristine();
          });
      };
    });



}());
