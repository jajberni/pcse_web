(function() {
    'use strict';
    var module = angular.module('core');

    /**
     * @name gaInputValidator
     * @memberOf angularModule.core
     * @description
     * This directive automatically adds following directives to element:
     * - (md-maxlength or ng-maxlength) with ng-minlength
     * - ng-pattern
     * Values for these directives are from python model validator factories (see BaseValidator in model/base.py)
     * Let's take for example user validator class:
     *
     * class UserValidator(model.BaseValidator):
     *      name = [3, 100]
     *
     * This min/max value for name is then passed to client as gaValidators.user.name === [3, 100]
     * Now, when we use directive:
     * <input name="name" ga-input-validator validator-category="user">
     * It will autmatically adds ng-minlength and ng-maxlength like this:
     * <input name="name" ga-input-validator ng-minlength="3" ng-maxlength="100" validator-category="user">
     *
     * If you want to use md-maxlength to show character counter pass show-counter="true"
     */
    module.directive('gaAutocompleteLocation', 
        function($compile, $log, $http,  _) {
        var compile = function(el, attrs) {
            //attrs.$set("mdSelectedItemChange","getLatLng(item)");
            //attrs.$set("mdSearchTextChange","search(searchText)");
            attrs.$set("mdSearchText","searchText");
            //attrs.$set("mdSelectedItem","selectedItem");
            attrs.$set("mdDelay","500");
            attrs.$set("mdItems","item in search(searchText)");
            attrs.$set("mdItemText","item.description");
            //Now that we added new directives to the element, proceed with compilation
            //but skip directives with priority 5000 or above to avoid infinite
            //recursion (we don't want to compile ourselves again)
            var compiled = $compile(el, null, 4000);
            return function(scope) {
                compiled(scope);
            };
        };

        var controller = function($scope, $q ) {
            $log.debug("[gaAutcomopleteLocation:controller] init")

            var osmProp = function (obj, name, def, pre, post){
                var res
                if (_.has(obj,name)){
                    res = pre+_.get(obj,name)+post;
                } else{
                    res = def;
                }
                return res;
            }
            var fixResultsProperties = function (target, obj){
                var res = ""
                if (_.has(obj,"street")){
                    res = res+_.get(obj,"street");
                    if (_.has(obj,"housenumber")){
                        res = res+" "+_.get(obj,"housenumber");
                    }
                    res = res+", ";
                } 
                var city = _.get(obj,"city",false);
                var name = _.get(obj,"name",false);
                if (city){
                    res = res+city;
                    if ( _.has(obj,"name") && name !== city ){
                        var pattern = "[,|\.|-]?\s*"+city+"\s*[,|\.|-]?"
                        var re = new RegExp(pattern, "g");
                        var name = _.trim(_.replace(name, re, ""));
                        res = name+", "+res;
                        target.name = name
                    } else {
                        target.name = city
                    }
                } else if (name){
                    target.city = false
                    res = res+name;
                }
                if (_.has(obj,"state")){
                    res = res+", "+_.get(obj,"state")+"";
                } else {
                    target.state = false
                }
                if (_.has(obj,"country")){
                    res = res+" ("+_.get(obj,"country")+")";
                } else {
                    target.country = false
                }
                if (_.has(obj,"osm_value")){
                    //res = res+"["+_.get(obj,"osm_value")+"]";
                }
                if (_.has(obj,"osm_key")){
                    //res = res+"["+_.get(obj,"osm_key")+"]";
                }
                target.description = res;
            }

            var getIcon = function(prop){
                var value = _.get(prop,"osm_value",false)
                var key = _.get(prop,"osm_key",false)
                var icon;
                if (value){
                    if (value === "village" || value === "town"){
                        return "home-modern"
                    }
                    if (value === "city"){
                        return "city"
                    }
                    if (value === "university" || value === "school"){
                        return "school"
                    }
                    if (value === "bus_stop"
                        || value === "bus"
                        || value === "bus_station"){
                        return "bus"
                    }
                    if (value === "tram_stop" 
                        || value === "tram_station"
                        || value === "tram"){
                        return "tram"
                    }
                    if (value === "train_stop"
                        || value === "train"
                        || value === "station"
                        || value === "railway"
                        || value === "train_station"){
                        return "train"
                    }
                    if (value === "lake" || value === "water"){
                        return "water"
                    }
                    if (value === "fuel" || value === "fuel"){
                        return "gas-station"
                    }
                    if (       value === "state" 
                            || value === "country" 
                            || value === "county" 
                            || value === "postcode"){
                        return "map-marker-radius"
                    }
                }
                if (key){
                    if (key === "boundary"){
                        return "map-marker-radius"
                    }
                    if (key === "historic"){
                        return "bank"
                    }
                    if (key === "tourism"){
                        return "routes"
                    }
                    if (key === "train_stop"
                        || key === "train"
                        || key === "station"
                        || key === "railway"
                        || key === "train_station"){
                        return "train"
                    }
                }
                // default
                return "map-marker"

            }

            var getResults = function(address) {
                var deferred = $q.defer();
                $http.get('https://photon.komoot.de/api/',{params:{q:address,limit:7}}).then(function(results) {
                    var places = results.data.features;
                    var unset = []
                    var mapPlaces = _.map(places, function(o,i,obj) { 
                        var prop = o.properties;
                        var res = {}
                        if (!_.has(prop,"name")){
                            unset.push(i)
                        }
                        fixResultsProperties(res, prop)
                        res.icon = getIcon(prop); // TODO what shoudl be used for icon?
                        //res.properties = o.properties
                        res.lat = o.geometry.coordinates[0];
                        res.lon = o.geometry.coordinates[1];
                        //res.geometry = o.geometry
                        return res; 
                        });
                    _.merge(places,mapPlaces);
                    // unset undefinied
                    // Does not work in the list (update possible?)
                    _.forEach(unset,function(i){
                        $log.warn("[gaAutcomopleteLocation:getResults] Should not be displayed")
                        $log.warn(places[i])
                        //_.unset(places,i);
                    });
                    deferred.resolve(places);
                });
                return deferred.promise;
            };

            var getDetails = function(place) {
              var deferred = $q.defer();
              placeService.getDetails({
                'placeId': place.place_id
              }, function(details) {
                deferred.resolve(details);
              });
              return deferred.promise;
            };

            $scope.search = function(input) {
                if (!input) {
                    return;
                }
                $log.debug("[gaAutcomopleteLocation:search] Search for '"+input+"'.")
                return getResults(input).then(function(places) {
                    $log.debug("[gaAutcomopleteLocation:search] Results for "+input+" are:");
                    $log.debug(places);
                    return places;
                });
            };
        }


        function getTemplate(element, attr) {
                  return '\
                              <md-item-template>\
                                <md-icon md-svg-icon="{{item.icon}}"></md-icon>\
                                <span md-highlight-text="searchText" md-highlight-flags="^i">{{item.description}}</span>\
                              </md-item-template>\
                              <md-not-found>\
                                No matches found for "{{searchText}}".\
                              </md-not-found>\
                              ';
        }


        return {
            priority : 4000, // High priority means it will execute first
            terminal : true, //Terminal prevents compilation of any other directive on first pass
            compile  : compile,
            controller  : controller,
            restrict : 'AE',
            template: getTemplate
            //templateUrl: '/p/modules/core/directives/gaAutocompleteLocation.client.dir.html'
        };
    });

}());
