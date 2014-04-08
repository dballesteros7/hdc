/**
 * 
 */

var hdcJawboneUp = angular.module('hdcJawboneUp');

hdcJawboneUp.config(function($provide, $httpProvider) {
	$provide.factory("proxyInterceptor",
			function($q, $window, $log) {
				/**
				 * Encoder utility function that takes a JSON object with
				 * parameters and serializes them into a URL-safe query string.
				 */
				var encoder = function(data) {
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
					request : function(config) {
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
 * Jawbone Up API wrapper service definition.
 */
hdcJawboneUp.factory('jawboneUpService', [ "$http", "$filter",
		function($http, $filter) {
			var api = {};
			api.options = [];

			return api;
		} ]);
