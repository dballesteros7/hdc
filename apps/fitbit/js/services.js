/**
 * Services for the HDC Nike+ plugin app. The nikeplus service provides a
 * wrapper around the Nike+ API as described in https://developer.nike.com This
 * module also provides an interceptor that redirects cross-domain requests ,
 * such as those directed to the Nike+ API, to a local endpoint located in
 * /proxy. The backend server must implement this /proxy endpoint to enable the
 * cross domain requests.
 */
var hdcFitbit = angular.module("hdcFitbit");

hdcFitbit.config(function($provide, $httpProvider){
    $provide.factory("proxyInterceptor",
            function($q, $window, $log){
                /**
                 * Encoder utility function that takes a JSON object with
                 * parameters and serializes them into a URL-safe query string.
                 */
                var encoder = function(data){
                    var ret = [];
                    for ( var d in data)
                        ret.push(encodeURIComponent(d) + "="
                                + encodeURIComponent(data[d]));
                    return ret.join("&");
                };
                /**
                 * Interceptor definition, it only intercepts correct requests
                 * that point to an URL on a different origin that the origin
                 * reported in the window object.
                 */
                var interceptor = {
                    request : function(config){
                        var baseURL = $window.location.href;
                        var targetURL = new URL(config.url, baseURL);
                        if (targetURL.origin != $window.location.origin) {
                            var encodedTarget = config.url;
                            if (config.params
                                    && Object.keys(config.params).length > 0) {
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
 * Fitbit API wrapper service definition.
 */
hdcFitbit
        .factory(
                "fitbit",
                [
                        "$http",
                        "$filter",
                        function($http, $filter){
                            var api = {};
                            api.timeseries = function(oauth_objects,
                                    resourcePath, endDate, period, successFunc,
                                    errorFunc){
                                var formattedEndDate = new Date(endDate);
                                formattedEndDate = $filter("date")(
                                        formattedEndDate, "yyyy-MM-dd");
                                var resourceUrl = "http://api.fitbit.com/1/user/-/"
                                        + resourcePath
                                        + "/date/"
                                        + formattedEndDate
                                        + "/"
                                        + period
                                        + ".json";
                                var parameters = {
                                    oauth_consumer_key : oauth_objects.consumer_key,
                                    oauth_token : oauth_objects.oauth_token,
                                    oauth_nonce : btoa(Math.random()
                                            + new Date().getTime()),
                                    oauth_timestamp : Math.round(new Date()
                                            .getTime() / 1000),
                                    oauth_signature_method : 'HMAC-SHA1',
                                    oauth_version : '1.0'
                                };
                                var encodedSignature = oauthSignature.generate(
                                        'GET', resourceUrl, parameters,
                                        oauth_objects.consumer_secret,
                                        oauth_objects.oauth_secret);
                                var oauth_headers = {
                                    Authorization : 'OAuth oauth_consumer_key="'
                                            + oauth_objects.consumer_key
                                            + '", oauth_token="'
                                            + oauth_objects.oauth_token
                                            + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="'
                                            + parameters.oauth_timestamp
                                            + '", oauth_nonce="'
                                            + parameters.oauth_nonce
                                            + '", oauth_signature="'
                                            + encodedSignature
                                            + '", oauth_version="1.0"'
                                };
                                $http({
                                    method : "GET",
                                    url : resourceUrl,
                                    headers : oauth_headers,
                                }).success(successFunc).error(errorFunc);
                            };
                            api.options = [ {
                                name : "Time series",
                                apiCall : api.timeseries,
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
                            } ];
                            return api;
                        } ]);
