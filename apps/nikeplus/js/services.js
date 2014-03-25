/**
 * Services for the HDC Nike+ plugin app. The nikeplus service provides a
 * wrapper around the Nike+ API as described in https://developer.nike.com This
 * module also provides an interceptor that redirects cross-domain requests ,
 * such as those directed to the Nike+ API, to a local endpoint located in
 * /proxy. The backend server must implement this /proxy endpoint to enable the
 * cross domain requests.
 */
var hdcNikePlus = angular.module("hdcNikePlus");

hdcNikePlus.config(function($provide, $httpProvider){
    $provide.factory("proxyInterceptor", function($q, $window, $log){
        /**
         * Encoder utility function that takes a JSON object with parameters and
         * serializes them into a URL-safe query string.
         */
        var encoder = function(data){
            var ret = [];
            for ( var d in data)
                ret.push(encodeURIComponent(d) + "="
                        + encodeURIComponent(data[d]));
            return ret.join("&");
        };
        /**
         * Interceptor definition, it only intercepts correct requests that
         * point to an URL on a different origin that the origin reported in the
         * window object.
         */
        var interceptor = {
            request : function(config){
                var baseURL = $window.location.href;
                var targetURL = new URL(config.url, baseURL);
                if (targetURL.origin != $window.location.origin) {
                    var encodedTarget = config.url;
                    if (Object.keys(config.params).length > 0) {
                        encodedTarget += "?" + encoder(config.params);
                    }
                    config.params = {
                        url_encoded : encodeURIComponent(encodedTarget)
                    };
                    config.url = '/proxy';
                }
                return config || $q.when(config);
            }
        };
        return interceptor;
    });
    // Register the interceptor in the $http provider.
    $httpProvider.interceptors.push('proxyInterceptor');
});

/**
 * Nike+ API wrapper service definition.
 */
hdcNikePlus.factory("nikeplus", [
        "$http",
        function($http){
            var api = {};

            api.sport = function(accessToken, success, error){
                $http({
                    method : "GET",
                    url : "https://api.nike.com/me/sport",
                    headers : {
                        Accept : "application/json"
                    },
                    params : {
                        access_token : accessToken
                    }
                }).success(success).error(error);
            };
            api.activities = function(accessToken, startDate, endDate, success,
                    error, url, previousData){
                var activitiesUrl = "https://api.nike.com/me/sport/activities";
                var params = {
                    access_token : accessToken
                };
                if (url) {
                    activitiesUrl = "https://api.nike.com" + url;
                    params = {};
                }
                $http({
                    method : "GET",
                    url : activitiesUrl,
                    headers : {
                        Accept : "application/json"
                    },
                    params : params
                }).success(
                        function(data, status, headers, config){
                            if (previousData) {
                                data.data.push.apply(data.data, previousData);
                            }
                            if (data.paging.next) {
                                api.activities(accessToken, startDate, endDate,
                                        success, error, data.paging.next,
                                        data.data);
                            } else {
                                success(data, status, headers, config);
                            }
                        }).error(error);
            };
            api.activitiesbyExperienceType = function(accessToken,
                    experienceType, startDate, endDate, success, error, url,
                    previousData){
                var activitiesUrl = "https://api.nike.com/me/sport/activities/"
                        + experienceType;
                var params = {
                    access_token : accessToken
                };
                if (url) {
                    activitiesUrl = "https://api.nike.com" + url;
                    params = {};
                }
                $http({
                    method : "GET",
                    url : activitiesUrl,
                    headers : {
                        Accept : "application/json"
                    },
                    params : params
                }).success(
                        function(data, status, headers, config){
                            if (previousData) {
                                data.data.push.apply(data.data, previousData);
                            }
                            if (data.paging.next) {
                                api.activitiesbyExperienceType(accessToken,
                                        experienceType, startDate, endDate,
                                        success, error, data.paging.next,
                                        data.data);
                            } else {
                                success(data, status, headers, config);
                            }
                        }).error(error);
            };
            api.activityDetails = function(accessToken, activityId, success,
                    error){
                $http(
                        {
                            method : "GET",
                            url : "https://api.nike.com/me/sport/activities/"
                                    + activityId,
                            headers : {
                                Accept : "application/json"
                            },
                            params : {
                                access_token : accessToken
                            }
                        }).success(success).error(error);
            };
            api.gpsData = function(accessToken, activityId, success, error){
                $http(
                        {
                            method : "GET",
                            url : "https://api.nike.com/me/sport/activities/"
                                    + activityId + "/gps",
                            headers : {
                                Accept : "application/json"
                            },
                            params : {
                                access_token : accessToken
                            }
                        }).success(success).error(error);
            };

            api.options = [ {
                name : "Sports summary",
                apiCall : api.sport,
                arguments : []
            }, {
                name : "Activity list",
                apiCall : api.activities,
                arguments : [ {
                    name : "Start date",
                    type : "date"
                }, {
                    name : "End date",
                    type : "date"
                } ]
            }, {
                name : "Activity list by experience type",
                apiCall : api.activitiesbyExperienceType,
                arguments : [ {
                    name : "Experience type",
                    type : "select",
                    options : [ "RUNNING", "FUELBAND" ]
                }, {
                    name : "Start date",
                    type : "date"
                }, {
                    name : "End date",
                    type : "date"
                } ]
            }, {
                name : "Activity details",
                apiCall : api.activityDetails,
                arguments : [ {
                    name : "Activity ID",
                    type : "text"
                } ]
            }, {
                name : "GPS for activity",
                apiCall : api.gpsData,
                arguments : [ {
                    name : "Activity ID",
                    type : "text"
                } ]
            } ];

            return api;
        } ]);
