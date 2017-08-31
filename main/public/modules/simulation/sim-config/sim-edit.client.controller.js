(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimEditController', function($scope, Restangular, _, gaToast, gaAppConfig, gaSimulations,
                                                    gaAuthentication, $log, NgMap, gaTracking) {

      $scope.auth = gaAuthentication;
      console.log("Here we are...");

      $scope.hasAuthorization = function() {
        return $scope.auth.isLogged();
      };

      if (!$scope.hasAuthorization()) {
        gaBrowserHistory.back();
      }



      $scope.$watch('simulation', function(newVal) {
            if (newVal) {
                $log.debug("[SimEditController:$watch(simulation)] simulation changed");
                $log.debug($scope.simulation);

                $scope.sim = $scope.simulation.clone();
                $log.debug($scope.sim);
                $log.debug($scope.sim.location);

                $scope.soil_attributes = $scope.sim.soil_attributes;

                $scope.getCurrentLocation = function(event){
                  $scope.sim.location.lat = event.latLng.lat();
                  $scope.sim.location.lon = event.latLng.lng();
                };

                NgMap.getMap().then(function(map) {
                  var markers = map.markers;
                  $scope.sim.lat = markers[0].position.lat();
                  $scope.sim.lng = markers[0].position.lng();
                });
            }
      });

      console.log("Here we are now...");





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
      $scope.sim.soil = {};

      // Soil variables
      $scope.sim.soil.SMW = 30.0;
      $scope.sim.soil.SMFCF = 46.0;
      $scope.sim.soil.SM0 = 57.0;
      $scope.sim.soil.CRAIRC = 5.0;
      $scope.sim.soil.RDMSOL = 120;

      $scope.sim.soil.SM = 45.0;*/

      console.log("Ready for simulation");



      $scope.run_simulation = function() {

        gaSimulations.saveAsync($scope.sim,true).then(function(updatedSimulation) {
            //_.extend($scope.user, $scope.editedUser);
            _.extend($scope.simulation, updatedSimulation);
            gaTracking.eventTrack('Simulation edit', $scope.sim.name, 'by', $scope.user);
            // gaBrowserHistory.back();
            gaToast.show('A simulation was successfully updated');
            $scope.simConfigForm.$setPristine();
        });
        /*
        gaToast.show('The simulation is running in the background...');
          $scope.sim.save().then(function() {
              _.extend($scope.simulation, );
              console.log($scope.simulation);
              gaToast.show('Simulation configuration was successfully saved.');
              $scope.simConfigForm.$setPristine();
          });*/
      };
    });



}());
