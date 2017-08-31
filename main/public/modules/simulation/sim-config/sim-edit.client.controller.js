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
                $log.debug($scope.sim.plot_data);

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

                //$scope.data = $scope.sim.plot_data;
            }
      });


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
            type: 'lineChart',
            height: 300,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function(e){ console.log("stateChange"); },
                changeState: function(e){ console.log("changeState"); },
                tooltipShow: function(e){ console.log("tooltipShow"); },
                tooltipHide: function(e){ console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (ms)'
            },
            yAxis: {
                axisLabel: 'Voltage (v)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            },
            callback: function(chart){
                console.log("!!! lineChart callback !!!");
            }
        },
        title: {
            enable: true,
            text: 'Title for Line Chart'
        },
        subtitle: {
            enable: true,
            text: 'Subtitle for simple line chart.',
            css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
            }
        },
        caption: {
            enable: true,
            html: '<b>Figure 1.</b> test',
            css: {
                'text-align': 'justify',
                'margin': '10px 13px 0px 7px'
            }
        }
      };

        $scope.data = sinAndCos();

        /*Random Data Generator */
        function sinAndCos() {
            var sin = [],sin2 = [],
                cos = [];

            //Data is represented as an array of {x,y} pairs.
            for (var i = 0; i < 100; i++) {
                sin.push({x: i, y: Math.sin(i/10)});
                sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
                cos.push({x: i, y: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
            }

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    values: sin,      //values - represents the array of {x,y} data points
                    key: 'Sine Wave', //key  - the name of the series.
                    color: '#ff7f0e'  //color - optional: choose your own line color.
                },
                {
                    values: cos,
                    key: 'Cosine Wave',
                    color: '#2ca02c'
                },
                {
                    values: sin2,
                    key: 'Another sine wave',
                    color: '#7777ff',
                    area: true      //area - set to true if you want this line to turn into a filled area chart.
                }
            ];
        };

    });



}());
