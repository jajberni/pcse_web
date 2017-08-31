(function() {
    'use strict';
    var module = angular.module('simulation');

    /**
     * @name wdTags
     * @memberOf angularModule.core
     * @description
     * Loads and updates tags
     */

    module.service('gaSimulations',
        function(Restangular,$log, $q,$timeout) {
        $log.debug("[gaSimulations] init ");
        var self = this;

        /*****************************************************************
         * loading is true if something is loading
         */
        this.loading = false;

        /*****************************************************************
         * Variables used in loadMoreSimulations
         */
        this.simulations = {} ;
        this.simulationsSorted = [];
        this.more = true;
        this.isLoading = false;
        var totalSimulations = 0;
        var nextCursor = '';
        this.simulationsChanged = function(){
            $log.debug("[gaSimulations:simulationsChanged] start ");
            self.simulationsSorted = _.orderBy(self.simulations,'modified','desc');
            $log.debug("[gaSimulations:simulationsChanged] simulations by id ");
            $log.debug(self.simulations);
            $log.debug("[gaSimulations:simulationsChanged] simulations sorted ");
            $log.debug(self.simulationsSorted)
        }
        /*****************************************************************
         * Load async 'simulations' from the server.
         * If a simulation is already available offline it is updated with the
         * server version.
         *
         * Parameters:
         *
         * Returns:
         * - simulations    : an array with the new loaded simulations
         */
        this.loadMoreSimulations = function() {
            $log.debug("[gaSimulations:loadMoreSimulations] start ");
            var deferred = $q.defer();
            if (!self.more || self.isLoading) {
                $log.warn("[gaSimulations:loadMoreSimulations] no more simulations or loading (more: "+self.more+",loading: "+self.isLoading);
                deferred.reject("No more tags are already loading");
            }
            self.isLoading = true;
            var newSimulations;
            var simulationsByKey;
            Restangular.all('simulations').getList({cursor: nextCursor,
                                            size:10,
                                            orderBy:"-modified",
                                            total:true})
                .then(function(simulations) {
                    $log.debug("[gaSimulations:loadMoreSimulations] then ");
                    newSimulations = simulations;
                    simulationsByKey = _.keyBy(simulations, 'id');
                    _.merge(self.simulations,simulationsByKey);
                    //self.simulations = self.simulations.concat(simulations);
                    nextCursor = simulations.meta.nextCursor;
                    self.more = simulations.meta.more;
                    totalSimulations = simulations.meta.totalCount;
                    self.simulationsChanged();
                })
                .finally(function() {
                    $log.debug("[gaSimulations:loadMoreSimulations] finally ");
                    self.isLoading = false;
                    // return loaded simulations
                    deferred.resolve(newSimulations);
            });
            return deferred.promise;
        }

        /*****************************************************************
         * Load the first batch (speed things up)
         */
        $timeout(self.loadMoreSimulations(),10);


        /*****************************************************************
         * Returns a simulation either by id, key, name, or index.
         * If the simulation is not already downloaded null or undefined is
         * returned.
         * If a it should get or update a simulation from the server use
         * getAsync().
         *
         * Parameters:
         * - options: {id:int ,key:str ,name:str ,index:int}
         *
         * Returns:
         * - simulation : simulation (as a promise)
         */
        this.get = function(options){
            $log.debug("[gaSimulations:get] start ");
            options = typeof options !== 'undefined' ? options : {};
            _.defaults(options,{id:null,
                                key:null,
                                name:null,
                                index:null});
            if (options.index !== null){
                return self.simulationsSorted[options.index];
            }
            if (options.id !== null){
                return self.simulations[options.id];
            }
            if (options.key !== null){
                return _.find(self.simulations['key',options.key]);
            }
            if (options.name !== null){
                return _.find(self.simulations,['name',options.name]);
            }
        };

        /*****************************************************************
         * Returns a promise which resolves a simulation depending on the given
         * option (id, key, name, or index).
         * If a simulation is not already available offline it gets it from the
         * server.
         * If the update option is set it reloads the simulation anyway.
         *
         * Parameters:
         * - options: {id:int ,key:str ,name:str ,index:int,
         *              update:false}
         *
         * Returns:
         * - simulation : simulation (as a promise)
         */
        this.getAsync = function(options){
            $log.debug("[gaSimulations:getAsync] start ");
            options = typeof options !== 'undefined' ? options : {};
            _.defaults(options,{id:null,
                                key:null,
                                name:null,
                                index:null,
                                update:false});
            self = this;
            var deferred = $q.defer();
            var simulation = self.get(options);
            if (simulation){
                if (options.update){
                    $log.debug("[gaSimulations:getAsync] update simulation ");
                    options.name = simulation.name;
                } else {
                    deferred.resolve(simulation);
                }
            }

            // get online
            if (options.name !== null){
                $log.debug("[gaSimulations:getAsync] get simulation online for "+options.name);
                Restangular.one('simulations', options.name).get().then(function(newSimulation) {
                    $log.debug("[gaSimulations:getAsync] new loaded simulation ");
                    $log.debug(newSimulation);
                    self.simulations[newSimulation.id]=newSimulation;
                    //_.merge(self.simulations[options.name],simulation);
                    deferred.resolve(newSimulation);
                });
            } else {
                $log.warn('You can ony load new simulations by name');
                deferred.reject('load new simulation only by name possible');
            }
            return deferred.promise;
        };

        this.getTotalSimulations = function(){
            $log.debug("[gaSimulations:getTotalSimulations] start ");
            //$log.debug("[gaSimulations:getTotalSimulations] total simulations: "+totalSimulations)
            return totalSimulations;
        };


        /*****************************************************************
         * Saves a simulation to the server.
         *
         * Parameters:
         * - simulationObject: A simulation object ({name:"",name:"",..}).
         * - update : update the simulation after save from the server.
         *            This gives the correct modified date.
         *            NOT IMPLEMENTED YET
         *
         * Returns:
         * - simulation : simulation (as a promise)
         */
        this.saveAsync = function(simulationObject,update){
            update = typeof update !== 'undefined' ? update : false;
            $log.debug("[gaSimulations:saveAsync] start ");
            $log.debug(simulationObject);
            $log.debug(update);
            simulationObject = typeof simulationObject !== 'undefined' ? simulationObject : {};
            var deferred = $q.defer();
            if (!simulationObject.hasOwnProperty('save')){
                $log.warn("[gaSimulations:saveAsync] Simulation has no save");
                if (!simulationObject.hasOwnProperty('id')){
                    $log.warn("[gaSimulations:saveAsync] Simulation has no id");
                    deferred.reject("Simulation has no id");
                } else {
                    // TODO better getAsync?
                    simulationObject = this.get({id:simulationObject.id});
                }
            }
            simulationObject.save().then(function(updatedSimulation){
                //if (update){
                    //self.getAsync({name:simulationObject.name})
                        //.then(function(){
                            //self.simulationsChanged()
                            //deferred.resolve(simulationObject);
                        //});
                //} else {
                    if (update){
                        _.extend(simulationObject, updatedSimulation);
                    }
                    self.simulations[simulationObject.id] = simulationObject;
                    self.simulationsChanged();
                    deferred.resolve(simulationObject);
                //}
            });
            return deferred.promise;
        }
        /*****************************************************************
         * Deletes a simulation from the server.
         *
         * Parameters:
         * - simulationObject: A simulation object ({name:"",name:"",..}).
         *
         * Returns:
         * - promise
         */
        this.removeAsync = function(simulationObject){
            $log.debug("[gaSimulations:removeAsync] start ");
            $log.debug("[gaSimulations:removeAsync] simulationObject ");
            $log.debug(simulationObject);
            simulationObject = typeof simulationObject !== 'undefined' ? simulationObject : {};
            var deferred = $q.defer();
            if (!simulationObject.hasOwnProperty('remove')){
                $log.warn("[gaSimulations:removeAsync] Simulation has no remove");
                if (!simulationObject.hasOwnProperty('id')){
                    $log.warn("[gaSimulations:removeAsync] Simulation has no id");
                    deferred.reject("Simulation has no id");
                } else {
                    // TODO better getAsync?
                    simulationObject = this.get({id:simulationObject.id})
                }
            }
            simulationObject.remove().then(function(){
                    //self.simulations[simulationObject.id] = undefined;
                    delete self.simulations[simulationObject.id];
                    self.simulationsChanged();
                    delete self.simulations[null];
                    deferred.resolve(simulationObject);
            }, function(msg){
                    deferred.reject(msg);
            });
            return deferred.promise;
        }


    });

}());
