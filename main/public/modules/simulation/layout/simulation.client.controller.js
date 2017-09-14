(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimulationController', function(gaAuthentication, gaToast, gaBrowserHistory, gaAppConfig,
                                                       $scope, $stateParams, gaSimulations) {
        if (!gaAuthentication.isLogged()) {
            gaToast.show('Sorry, you don\'t have permissions to access those pages');
            gaBrowserHistory.back();
        }
      $scope.user = gaAuthentication.user;
      $scope.cfg = gaAppConfig;

      gaSimulations.getAsync({name:$stateParams.name}).then(function(simulation) {
            //Restangular.one('users', $stateParams.username).get().then(function(user) {
                $scope.simulation = simulation;

            });

    });

}());
