(function() {
    'use strict';
    var module = angular.module('users');

    /**
     * @name wdTags
     * @memberOf angularModule.core
     * @description
     * Loads and updates tags
     */

    module.service('gaUsers', 
        function(Restangular,$log, $q,$timeout) {
        $log.debug("[gaUsers] init ");
        var self = this;

        /*****************************************************************
         * loading is true if something is loading
         */
        this.loading = false;

        /*****************************************************************
         * Variables used in loadMoreUsers
         */
        this.users = {} ;
        this.usersSorted = [];
        this.more = true;
        this.isLoading = false;
        var totalUsers = 0;
        var nextCursor = '';
        this.usersChanged = function(){
            $log.debug("[gaUsers:usersChanged] start ")
            self.usersSorted = _.orderBy(self.users,'modified','desc');
            $log.debug("[gaUsers:usersChanged] users by id ")
            $log.debug(self.users)
            $log.debug("[gaUsers:usersChanged] users sorted ")
            $log.debug(self.usersSorted)
        }
        /*****************************************************************
         * Load async 'users' from the server.
         * If a user is already available offline it is updated with the 
         * server version.
         *
         * Parameters:
         *
         * Returns:
         * - users    : an array with the new loaded users
         */
        this.loadMoreUsers = function() {
            $log.debug("[gaUsers:loadMoreUsers] start ")
            var deferred = $q.defer();
            if (!self.more || self.isLoading) {
                $log.warn("[gaUsers:loadMoreUsers] no more users or loading (more: "+self.more+",loading: "+self.isLoading)
                deferred.reject("No more tags are already loading");
            }
            self.isLoading = true;
            var newUsers;
            var usersByKey;
            Restangular.all('users').getList({cursor: nextCursor, 
                                            size:10,
                                            orderBy:"-modified",
                                            total:true})
                .then(function(users) {
                    $log.debug("[gaUsers:loadMoreUsers] then ")
                    newUsers = users
                    usersByKey = _.keyBy(users, 'id')
                    _.merge(self.users,usersByKey);
                    //self.users = self.users.concat(users);
                    nextCursor = users.meta.nextCursor;
                    self.more = users.meta.more;
                    totalUsers = users.meta.totalCount;
                    self.usersChanged();
                })
                .finally(function() {
                    $log.debug("[gaUsers:loadMoreUsers] finally ")
                    self.isLoading = false;
                    // return loaded users
                    deferred.resolve(newUsers);
            });
            return deferred.promise;
        }
        
        /*****************************************************************
         * Load the first batch (speed things up)
         */
        $timeout(self.loadMoreUsers(),10);


        /*****************************************************************
         * Returns a user either by id, key, username, or index.
         * If the user is not already downloaded null or undefined is
         * returned.
         * If a it should get or update a user from the server use
         * getAsync().
         *
         * Parameters:
         * - options: {id:int ,key:str ,username:str ,index:int}
         *
         * Returns:
         * - user : user (as a promise)
         */
        this.get = function(options){
            $log.debug("[gaUsers:get] start ")
            options = typeof options !== 'undefined' ? options : {};
            _.defaults(options,{id:null,
                                key:null,
                                username:null,
                                index:null})
            if (options.index !== null){
                return self.usersSorted[options.index];
            }
            if (options.id !== null){
                return self.users[options.id];
            }
            if (options.key !== null){
                return _.find(self.users['key',options.key]);
            }
            if (options.username !== null){
                return _.find(self.users,['username',options.username]);
            }
        }

        /*****************************************************************
         * Returns a promies which resolves a user depending on the given
         * option (id, key, username, or index).
         * If a user is not already available offline it gets it from the
         * server.
         * If the uptdate option is set it reloads the user anyway.
         *
         * Parameters:
         * - options: {id:int ,key:str ,username:str ,index:int,
         *              update:false}
         *
         * Returns:
         * - user : user (as a promise)
         */
        this.getAsync = function(options){
            $log.debug("[gaUsers:getAsync] start ")
            options = typeof options !== 'undefined' ? options : {};
            _.defaults(options,{id:null,
                                key:null,
                                username:null,
                                index:null,
                                update:false})
            self = this;
            var deferred = $q.defer();
            var user = self.get(options);
            if (user){
                if (options.update){
                    $log.debug("[gaUsers:getAsync] update user ")
                    options.username = user.username;
                } else {
                    deferred.resolve(user);
                }
            } 

            // get online
            if (options.username !== null){
                $log.debug("[gaUsers:getAsync] get user online for "+options.username)
                Restangular.one('users', options.username).get().then(function(newUser) {
                    $log.debug("[gaUsers:getAsync] new loaded user ")
                    $log.debug(newUser)
                    self.users[newUser.id]=newUser;
                    //_.merge(self.users[options.username],user);
                    deferred.resolve(newUser);
                });
            } else {
                $log.warn('You can ony load new users by username')
                deferred.reject('load new user only by username possible')
            }
            return deferred.promise;
        }

        this.getTotalUsers = function(){
            $log.debug("[gaUsers:getTotalUsers] start ")
            //$log.debug("[gaUsers:getTotalUsers] total users: "+totalUsers)
            return totalUsers;
        }


        /*****************************************************************
         * Saves a user to the server.
         *
         * Parameters:
         * - userObject: A user object ({username:"",name:"",..}).
         * - update : update the user after save from the server.
         *            This gives the correct modified date.
         *            NOT IMPLEMENTED YET
         *
         * Returns:
         * - user : user (as a promise)
         */
        this.saveAsync = function(userObject,update){
            update = typeof update !== 'undefined' ? update : false;
            $log.debug("[gaUsers:saveAsync] start ")
            userObject = typeof userObject !== 'undefined' ? userObject : {};
            var deferred = $q.defer();
            if (!userObject.hasOwnProperty('save')){
                $log.warn("[gaUsers:saveAsync] User has no save");
                if (!userObject.hasOwnProperty('id')){
                    $log.warn("[gaUsers:saveAsync] User has no id");
                    deferred.reject("User has no id");
                } else {
                    // TODO better getAsync?
                    userObject = this.get({id:userObject.id})
                }
            }
            userObject.save().then(function(updatedUser){
                //if (update){
                    //self.getAsync({username:userObject.username})
                        //.then(function(){
                            //self.usersChanged()
                            //deferred.resolve(userObject);
                        //});
                //} else {
                    if (update){
                        _.extend(userObject, updatedUser);
                    }
                    self.users[userObject.id] = userObject
                    self.usersChanged()
                    deferred.resolve(userObject);
                //}
            });
            return deferred.promise;
        }
        /*****************************************************************
         * Deletes a user from the server.
         *
         * Parameters:
         * - userObject: A user object ({username:"",name:"",..}).
         *
         * Returns:
         * - promise
         */
        this.removeAsync = function(userObject){
            $log.debug("[gaUsers:removeAsync] start ")
            $log.debug("[gaUsers:removeAsync] userObject ")
            $log.debug(userObject)
            userObject = typeof userObject !== 'undefined' ? userObject : {};
            var deferred = $q.defer();
            if (!userObject.hasOwnProperty('remove')){
                $log.warn("[gaUsers:removeAsync] User has no remove");
                if (!userObject.hasOwnProperty('id')){
                    $log.warn("[gaUsers:removeAsync] User has no id");
                    deferred.reject("User has no id");
                } else {
                    // TODO better getAsync?
                    userObject = this.get({id:userObject.id})
                }
            }
            userObject.remove().then(function(){
                    //self.users[userObject.id] = undefined;
                    delete self.users[userObject.id];
                    self.usersChanged()
                    delete self.users[null];
                    deferred.resolve(userObject);
            }, function(msg){
                    deferred.reject(msg);
            });
            return deferred.promise;
        }


    });

}());
