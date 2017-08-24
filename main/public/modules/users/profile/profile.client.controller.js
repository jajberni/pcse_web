(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ProfileController', 
        function($scope, Restangular, gaAppConfig, gaAuthentication, 
                    $stateParams, _, $mdDialog, gaToast, $state,
                    gaUsers, $log) {
        $log.debug("[ProfileController] init")
        $scope.cfg = gaAppConfig;
        $scope.auth = gaAuthentication;
        $scope.isMyProfile = function() {
            return gaAuthentication.isLogged() && $stateParams.username === gaAuthentication.user.username;
        };

        if ($scope.isMyProfile()) {
            $scope.user = gaAuthentication.user;
            $scope.user.locationRaw = { description : $scope.user.location};
        } else {
            gaUsers.getAsync({username:$stateParams.username}).then(function(user) {
            //Restangular.one('users', $stateParams.username).get().then(function(user) {
                $scope.user = user;
                $scope.user.locationRaw = { description : $scope.user.location};
            });
        }

        $scope.getAvailableSocialAccounts = function() {
            $log.debug("[ProfileController:getAvailableSocialAccount] start")
            if (!$scope.user) {
                return;
            }
            return _.pickBy($scope.socialAccounts, function(soc, socKey) {
                /*jslint unparam:true*/
                return !!$scope.user[socKey];
            });
        };

        $scope.hasAuthorization = function() {
            return $scope.isMyProfile() || $scope.auth.isAdmin();
        };

        $scope.showDeleteUserDialog = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Do you really want to delete user ' + $scope.user.username)
                .content('Note, these deletion is irreversible')
                .ariaLabel('Delete User')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                gaUsers.removeAsync($scope.user).then(function() {
                    gaToast.show('User ' + $scope.user.username + ' was deleted');
                    $state.go('users');
                });
            });
        };

        $scope.socialAccounts = {
            facebook  : {
                domain : 'facebook.com',
                name   : 'Facebook',
                icon   : 'facebook'
            },
            twitter   : {
                domain : 'twitter.com',
                name   : 'Twitter',
                icon   : 'twitter'
            },
            gplus     : {
                domain : 'plus.google.com',
                name   : 'Google Plus',
                icon   : 'google-plus'
            },
            instagram : {
                domain : 'instagram.com',
                name   : 'Instagram',
                icon   : 'instagram'
            },
            linkedin  : {
                domain : 'linkedin.com/in',
                name   : 'Linkedin',
                icon   : 'linkedin'
            },
            github    : {
                domain : 'github.com',
                name   : 'Github',
                icon   : 'github-circle'
            }
        };
    });
}());
