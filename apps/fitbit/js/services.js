/**
 * Services for the HDC Fitbit plugin app. The fitbit service provides a wrapper
 * around the Fitbit API as described in https://dev.fitbit.com This module also
 * provides an interceptor that redirects cross-domain requests , such as those
 * directed to https://api.fitbit.com, to a local resource located in /proxy.
 * The backend server must implement this /proxy endpoint to enable the cross
 * domain requests. The cross domain requests are identified by an argument in
 * the config object, named 'crossDomainRequireProxy' which must be set to a
 * truthy value.
 */
var hdcFitbit = angular.module("hdcFitbit");

hdcFitbit
        .config(function($provide, $httpProvider){
            $provide
                    .factory(
                            "proxyInterceptor",
                            function($q, $window, $log){
                                /**
                                 * Encoder utility function that takes a JSON
                                 * object with parameters and serializes it.
                                 */
                                var serialize = function(data){
                                    var ret = [];
                                    for ( var d in data)
                                        ret.push(d + "=" + data[d]);
                                    return ret.join("&");
                                };
                                /**
                                 * Interceptor definition, it intercepts
                                 * requests that contain the 'cors-require
                                 */
                                var interceptor = {
                                    request : function(config){
                                        if (config.crossDomainRequireProxy) {
                                            var encodedTarget = config.url;
                                            if (config.params
                                                    && Object
                                                            .keys(config.params).length > 0) {
                                                encodedTarget += "?"
                                                        + serialize(config.params);
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
 * OAuth 1.0 service
 */
hdcFitbit.factory("oauth1", function oauth1Factory(){
    var generateNonce = function(){
        return Math.random() * (100000);
    };
    return function(url, method, parameters, oauthObjects){
        var oauthParameters = {
            oauth_consumer_key : oauthObjects.consumer_key,
            oauth_token : oauthObjects.oauth_token,
            oauth_nonce : generateNonce(),
            oauth_timestamp : Math.round(new Date().getTime() / 1000),
            oauth_signature_method : "HMAC-SHA1",
            oauth_version : "1.0"
        };
        for ( var k in parameters) {
            if (oauthParameters.k === undefined) {
                oauthParamters[k] = parameters[k];
            }
        }
        var encodedSignature = oauthSignature.generate(method, url,
                oauthParameters, oauthObjects.consumer_secret,
                oauthObjects.oauth_token_secret);
        return 'OAuth oauth_consumer_key="'
                + oauthParameters.oauth_consumer_key + '", oauth_token="'
                + oauthParameters.oauth_token + '", oauth_signature_method="'
                + oauthParameters.oauth_signature_method
                + '", oauth_timestamp="' + oauthParameters.oauth_timestamp
                + '", oauth_nonce="' + oauthParameters.oauth_nonce
                + '", oauth_signature="' + encodedSignature
                + '", oauth_version="' + oauthParameters.oauth_version + '"';
    };
});

/**
 * Fitbit API wrapper service definition.
 */
hdcFitbit
        .factory(
                "fitbit",
                [
                        "$http",
                        "$filter",
                        "oauth1",
                        function($http, $filter, oauth1){
                            var api = {};
                            var timeseries = function(oauthObjects,
                                    resourcePath, endDate, period, successFunc,
                                    errorFunc){
                                var formattedEndDate = $filter("date")(
                                        new Date(endDate), "yyyy-MM-dd");
                                var resourceUrl = "http://api.fitbit.com/1/user/-/"
                                        + resourcePath
                                        + "/date/"
                                        + formattedEndDate
                                        + "/"
                                        + period
                                        + ".json";
                                var method = "GET";
                                var headers = {
                                    Authorization : oauth1(resourceUrl, method,
                                            {}, oauthObjects)
                                };
                                $http({
                                    method : method,
                                    url : resourceUrl,
                                    headers : headers,
                                    crossDomainRequireProxy : true,
                                }).success(successFunc).error(errorFunc);
                            };
                            var noArgsCall = function(resourceUrl){
                                return function(oauthObjects, successFunc,
                                        errorFunc){
                                    var method = "GET";
                                    var headers = {
                                        Authorization : oauth1(resourceUrl,
                                                method, {}, oauthObjects)
                                    };
                                    $http({
                                        method : method,
                                        url : resourceUrl,
                                        headers : headers,
                                        crossDomainRequireProxy : true,
                                    }).success(successFunc).error(errorFunc);

                                };
                            };
                            var endDateWithPeriodCall = function(baseUrl){
                                return function(oauthObjects, endDate, period,
                                        successFunc, errorFunc){
                                    var resourceUrl = baseUrl
                                            + $filter("date")(
                                                    new Date(endDate),
                                                    "yyyy-MM-dd") + "/"
                                            + period + ".json";
                                    var method = "GET";
                                    var headers = {
                                        Authorization : oauth1(resourceUrl,
                                                method, {}, oauthObjects)
                                    };
                                    $http({
                                        method : method,
                                        url : resourceUrl,
                                        headers : headers,
                                        crossDomainRequireProxy : true,
                                    }).success(successFunc).error(errorFunc);
                                };
                            };
                            var singleDateCall = function(baseUrl){
                                return function(oauthObjects, date,
                                        successFunc, errorFunc){
                                    var resourceUrl = baseUrl
                                            + $filter("date")(new Date(date),
                                                    "yyyy-MM-dd") + ".json";
                                    var method = "GET";
                                    var headers = {
                                        Authorization : oauth1(resourceUrl,
                                                method, {}, oauthObjects)
                                    };
                                    $http({
                                        method : method,
                                        url : resourceUrl,
                                        headers : headers,
                                        crossDomainRequireProxy : true,
                                    }).success(successFunc).error(errorFunc);
                                };
                            };
                            api.options = [
                                    {
                                        name : "Time series for resource",
                                        apiCall : timeseries,
                                        arguments : [
                                                {
                                                    name : "Resource",
                                                    type : "select",
                                                    options : [
                                                            {
                                                                name : "Calories intake",
                                                                value : "foods/log/caloriesIn"
                                                            },
                                                            {
                                                                name : "Water consumption",
                                                                value : "foods/log/water"
                                                            },
                                                            {
                                                                name : "Calories burned",
                                                                value : "activities/calories"
                                                            },
                                                            {
                                                                name : "Calories burned (BMR)",
                                                                value : "activties/caloriesBMR"
                                                            },
                                                            {
                                                                name : "Steps",
                                                                value : "activities/steps"
                                                            },
                                                            {
                                                                name : "Distance",
                                                                value : "activities/distance"
                                                            },
                                                            {
                                                                name : "Floors",
                                                                value : "activities/floors"
                                                            },
                                                            {
                                                                name : "Elevation",
                                                                value : "activities/elevation"
                                                            },
                                                            {
                                                                name : "Sedentary minutes",
                                                                value : "activities/minutesSedentary"
                                                            },
                                                            {
                                                                name : "Lightly active minutes",
                                                                value : "activities/minutesLightlyActive"
                                                            },
                                                            {
                                                                name : "Fairly active minutes",
                                                                value : "activities/minutesFairlyActive"
                                                            },
                                                            {
                                                                name : "Very active minutes",
                                                                value : "activities/minutesVeryActive"
                                                            },
                                                            {
                                                                name : "Activity calories",
                                                                value : "activities/activityCalories"
                                                            },
                                                            {
                                                                name : "Sleep start time",
                                                                value : "sleep/startTime"
                                                            },
                                                            {
                                                                name : "Time in bed",
                                                                value : "sleep/timeInBed"
                                                            },
                                                            {
                                                                name : "Minutes asleep",
                                                                value : "sleep/minutesAsleep"
                                                            },
                                                            {
                                                                name : "Awakenings count",
                                                                value : "sleep/awakeningsCount"
                                                            },
                                                            {
                                                                name : "Minutes awake",
                                                                value : "sleep/minutesAwake"
                                                            },
                                                            {
                                                                name : "Minutes to fall asleep",
                                                                value : "sleep/minutesToFallAsleep"
                                                            },
                                                            {
                                                                name : "Minutes after wake up",
                                                                value : "sleep/minutesAfterWakeUp"
                                                            },
                                                            {
                                                                name : "Sleep efficiency",
                                                                value : "sleep/efficiency"
                                                            }, ]
                                                }, {
                                                    name : "End date",
                                                    type : "date"
                                                }, {
                                                    name : "Period",
                                                    type : "select",
                                                    options : [ {
                                                        name : "1 day",
                                                        value : "1d"
                                                    }, {
                                                        name : "1 week",
                                                        value : "7d"
                                                    }, {
                                                        name : "1 month",
                                                        value : "30d"
                                                    }, {
                                                        name : "3 months",
                                                        value : "3m"
                                                    }, {
                                                        name : "6 months",
                                                        value : "6m"
                                                    }, {
                                                        name : "1 year",
                                                        value : "1y"
                                                    }, {
                                                        name : "All time",
                                                        value : "max"
                                                    } ]
                                                } ]
                                    },
                                    {
                                        name : "Activity statistics",
                                        apiCall : noArgsCall("http://api.fitbit.com/1/user/-/activities.json"),
                                        arguments : []
                                    },
                                    {
                                        name : "User profile",
                                        apiCall : noArgsCall("http://api.fitbit.com/1/user/-/profile.json"),
                                        arguments : []
                                    },
                                    {
                                        name : "Body measurements",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/body/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Body weight",
                                        apiCall : endDateWithPeriodCall("http://api.fitbit.com/1/user/-/body/log/weight/date/"),
                                        arguments : [ {
                                            name : "End date",
                                            type : "date"
                                        }, {
                                            name : "Period",
                                            type : "select",
                                            options : [ {
                                                name : "1 day",
                                                value : "1d"
                                            }, {
                                                name : "7 days",
                                                value : "7d"
                                            }, {
                                                name : "30 days",
                                                value : "30d"
                                            }, {
                                                name : "1 week",
                                                value : "1w"
                                            }, {
                                                name : "1 month",
                                                value : "1m"
                                            } ]
                                        } ]
                                    },
                                    {
                                        name : "Body fat",
                                        apiCall : endDateWithPeriodCall("http://api.fitbit.com/1/user/-/body/log/fat/date/"),
                                        arguments : [ {
                                            name : "End date",
                                            type : "date"
                                        }, {
                                            name : "Period",
                                            type : "select",
                                            options : [ {
                                                name : "1 day",
                                                value : "1d"
                                            }, {
                                                name : "7 days",
                                                value : "7d"
                                            }, {
                                                name : "30 days",
                                                value : "30d"
                                            }, {
                                                name : "1 week",
                                                value : "1w"
                                            }, {
                                                name : "1 month",
                                                value : "1m"
                                            } ]
                                        } ]
                                    },
                                    {
                                        name : "Activities",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/activities/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Food logs",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/foods/log/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Water consumption",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/foods/log/water/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Sleep times",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/sleep/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Heart rate",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/heart/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Blood pressure",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/bp/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    },
                                    {
                                        name : "Glucose level",
                                        apiCall : singleDateCall("http://api.fitbit.com/1/user/-/glucose/date/"),
                                        arguments : [ {
                                            name : "Date",
                                            type : "date"
                                        } ]
                                    } ];
                            return api;
                        } ]);
