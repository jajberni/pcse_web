(function() {
    'use strict';

    var module = angular.module('simulation');
    module.config(function($stateProvider) {
        $stateProvider
            .state('simulation', {
                url         : '/simulation',
                abstract    : true,
                controller  : 'SimulationController',
                templateUrl : '/p/modules/simulation/layout/simulation.client.view.html'
            })
            .state('simulation.simConfig', {
                url         : '/sim_config',
                controller  : 'SimConfigController',
                templateUrl : '/p/modules/simulation/sim-config/sim-config.client.view.html'
            });
    });
}());
