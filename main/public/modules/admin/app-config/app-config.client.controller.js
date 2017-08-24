(function() {
    'use strict';
    var module = angular.module('admin');

    module.controller('AdminAppConfigController', function($scope, Restangular, _, gaToast, gaAppConfig,$log) {
        Restangular.one('config').get().then(function(cfg) {
            $scope.cfg = cfg;
            var opt = _.pickBy(cfg, function(prop, name) {
                return _.startsWith(name, 'auth_');
            });
            $scope.authOptions = {};
            _.map(opt,function(value,key){
                var type = propertyType(key);
                var name = $scope.getAuthName(key);
                _.set($scope.authOptions,[name,type,'value'],value);
                _.set($scope.authOptions,[name,type,'name'],name);
                _.set($scope.authOptions,[name,type,'title'],propertyTypeText(key));
                _.set($scope.authOptions,[name,'title'],_.capitalize(name));
                _.set($scope.authOptions,[name,type,'key'],key);
            });
            $log.debug($scope.authOptions);

        });

        var propertyType= function(key) {
            if ( _.endsWith(key, '_secret')){
                return "secret"
            }
            if ( _.endsWith(key, '_id')){
                return "id"
            }
            if ( _.endsWith(key, '_icon')){
                return "icon"
            }
            return ""
        };

        var propertyTypeText = function(key) {
            var type = propertyType(key);
            if ( type === 'secret'){
                return "Secret Key"
            }
            if ( type === 'id'){
                return "Public ID"
            }
            if ( type === 'icon'){
                return "Icon"
            }
            return ""
        };

        $scope.getAuthName = function(str) {
            return str.replace('_id', '').replace('_secret', '').replace('auth_', '').replace('_icon', '');
        };

        $scope.save = function() {
            $scope.cfg.save().then(function() {
                _.extend(gaAppConfig, $scope.cfg);
                gaToast.show('Application configuration was successfully saved.');
                $scope.appConfigForm.$setPristine();
            });
        };

    });

}());
