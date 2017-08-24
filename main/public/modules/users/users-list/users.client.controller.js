(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('UsersController', function($scope, Restangular,
            $log, $window,$timeout,gaUsers) {
        $log.debug("[UserController] init")

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

        //gaUsers.loadMoreUsers();

        $scope.totalUsers = 0;
        $scope.gaUser = gaUsers

        // In this example, we set up our model using a plain object.
        // Using a class works too. All that matters is that we implement
        // getItemAtIndex and getLength.
        $scope.repeatedUsers = {
          // Required.
          getItemAtIndex: function(index) {
            var user = gaUsers.get({index:index});
            if (user !== undefined) {
              return user
            }
            if (gaUsers.more && !gaUsers.isLoading) {
                gaUsers.loadMoreUsers();
            }
            return null;
          },
          // Required.
          // For infinite scroll behavior, we always return a slightly higher
          // number than the previously loaded items.
          getLength: function() {
            $scope.totalUsers = gaUsers.getTotalUsers();
            return $scope.totalUsers;
          }
        };



    });
}());
