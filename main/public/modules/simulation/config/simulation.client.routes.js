(function() {
    'use strict';

    var module = angular.module('simulation');
    module.config(function($stateProvider) {
        $stateProvider
            .state('simConfig', {
                url         : '/sim_config',
                controller  : 'SimConfigController',
                templateUrl : '/p/modules/simulation/sim-config/sim-config.client.view.html'
            }).state('simulations', {
                url         : '/simulations',
                controller  : 'SimulationsController',
                templateUrl : '/p/modules/simulation/simulations-list/simulations.client.view.html'
            })
            .state('simulation', {
                url         : '/simulation/:name',
                abstract    : true,
                views    : {
                  '': {
                    templateUrl: '/p/modules/simulation/layout/simulation.client.view.html',
                    controller: 'SimulationController'
                  }
                }
            }).state('simulation.edit', {
                url         : '/edit',
                controller  : 'SimEditController',
                templateUrl : '/p/modules/simulation/sim-config/sim-edit.client.view.html'
            });
    });
}());
