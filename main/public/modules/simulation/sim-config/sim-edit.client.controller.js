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
                //$log.debug($scope.sim);

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

                $scope.data = JSON.parse($scope.sim.plot_data);
                $scope.data[0].yAxis = 1;
                $scope.data[0].type = "line";
                $scope.data[1].yAxis = 1;
                $scope.data[1].type = "line";
                $scope.data[2].yAxis = 2;
                $scope.data[2].type = "line";
                $scope.data[3].yAxis = 2;
                $scope.data[3].type = "line";
                $log.debug("[SimEditController: post data");

                $log.debug($scope.data);
            }
      }, true);


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

      $scope.options = {
        chart: {
            type: 'multiChart',
            height: 300,
            margin : {
                top: 20,
                right: 100,
                bottom: 40,
                left: 50
            },
            x: function(d){ return d[0]*1e3; },
            y: function(d){ return d[1]; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function(e){ console.log("stateChange"); },
                changeState: function(e){ console.log("changeState"); },
                tooltipShow: function(e){ console.log("tooltipShow"); },
                tooltipHide: function(e){ console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Date',
                tickFormat: function(d) {
                    return d3.time.format('%m/%d/%y')(new Date(d))
                },
                showMaxMin: false,
                staggerLabels: true
            },
            yAxis1: {
              axisLabel: 'Leaf Area Index & Soil Moisture [cm3/cm3]',
                tickFormat: function(d){
                    return d3.format(',.02f')(d);
                },
              axisLabelDistance: -10
            },
            yAxis2: {
              axisLabel: 'Grain & Total Biomass',
                tickFormat: function(d){
                    return d3.format(',.0f')(d);
                },
              axisLabelDistance: -10
            },

            callback: function(chart){
                console.log("!!! lineChart callback !!!");
            }
        },
        title: {
            enable: true,
            text: 'Model outputs'
        },
        subtitle: {
            enable: true,
            text: 'Click on variables for hide/show',
            css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
            }
        },
        caption: {
            enable: true,
            html: '<b>Figure 1.</b>LAI, Soil Moisture and Biomass',
            css: {
                'text-align': 'justify',
                'margin': '10px 13px 0px 7px'
            }
        }
      };

    });



}());
