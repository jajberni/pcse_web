(function() {
    'use strict';
    var module = angular.module('simulation');

    module.controller('SimulationController', function(gaAuthentication, gaToast, gaBrowserHistory) {
        if (!gaAuthentication.isLogged()) {
            gaToast.show('Sorry, you don\'t have permissions to access those pages');
            gaBrowserHistory.back();
        }
    });

}());
