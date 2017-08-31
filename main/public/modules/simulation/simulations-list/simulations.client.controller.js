(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimulationsController', function($scope, Restangular,
            $log, $window,$timeout,gaSimulations) {

        $log.debug("[SimulationController] init");

        var self = this;
        // flexible height fix for the virtual container
        // https://github.com/angular/material/issues/4314
        // might not be necessary in future angular material design versions
        // TODO create a directive
        $scope.listStyle = {
            height: ($window.innerHeight - 240) + 'px'
        };

        $window.addEventListener('resize', onResize);
        function onResize() {
            $scope.listStyle.height = ($window.innerHeight - 240) + 'px';
            $timeout($scope.$broadcast('$md-resize'),100);
            //if(!$scope.$root.$$phase){
                //$scope.$digest();
            //}
        }

        //gaSimulations.loadMoreSimulations();

        $scope.totalSimulations = 0;
        $scope.gaSimulation = gaSimulations

        // In this example, we set up our model using a plain object.
        // Using a class works too. All that matters is that we implement
        // getItemAtIndex and getLength.
        $scope.repeatedSimulations = {
          // Required.
          getItemAtIndex: function(index) {
            var simulation = gaSimulations.get({index:index});
            if (simulation !== undefined) {
              return simulation
            }
            if (gaSimulations.more && !gaSimulations.isLoading) {
                gaSimulations.loadMoreSimulations();
            }
            return null;
          },
          // Required.
          // For infinite scroll behavior, we always return a slightly higher
          // number than the previously loaded items.
          getLength: function() {
            $scope.totalSimulations = gaSimulations.getTotalSimulations();
            return $scope.totalSimulations;
          }
        };

    });
}());
