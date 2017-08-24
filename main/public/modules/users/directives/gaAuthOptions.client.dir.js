(function() {
    'use strict';
    var module = angular.module('users');

    /**
     * @name gaAuthOptions
     * @memberOf angularModule.users
     * @description
     * Inserts buttons for authentication via social networks
     * Auth services, for which no public key is stored in datastore, are not inserted
     * Also inserts 'remember me' checkbox, which can be binded by remember="myModel"
     */

    module.directive('gaAuthOptions', function(gaAppConfig,$log) {
        var link = function(scope) {
            $log.debug('[gaAuthOptions:link] init');
            scope.authOptions = _.keys(_.pickBy(gaAppConfig, function(cfg, cfgName) {
                return _.startsWith(cfgName, 'auth_') && _.endsWith(cfgName, '_id')&& cfg;
            }));
            scope.authOptions = _.map(scope.authOptions, function(optName) {
                return optName.replace('auth_', '').replace('_id', '');
            });
            scope.authOptions.unshift('google');
            scope.remember = true;
            
            // Icons
            var icons = _.pickBy(gaAppConfig, function(cfg, cfgName) {
                $log.debug(cfg);
                $log.debug(cfgName);
                return _.startsWith(cfgName, 'auth_') && _.endsWith(cfgName, '_icon');
            });
            scope.authIcons = _.mapKeys(icons, function(value, key) {
                return key.replace('auth_', '').replace('_icon', '');
            });
            scope.authIcons.google = "google"; // TODO at it to the server side config
        };

        return {
            link        : link,
            restrict    : 'EA',
            scope       : {
                remember : '='
            },
            templateUrl : '/p/modules/users/directives/gaAuthOptions.client.dir.html'
        };

    });

}());
