(function () {
    'use strict';
    var serviceId = 'authorizationSvc';
    angular.module('ar-auth').factory(serviceId, [
		'$injector', '$q', 'authConfig', 'httpBuffer', function ($injector, $q, authConfig, httpBuffer) {
		    return {
		        setAuthToken: setAuthToken,
		        resetAuthToken: resetAuthToken
		    };

		    function setAuthToken(token) {
		        var $http = $injector.get("$http");
		        $http.defaults.headers.common.Authorization = 'bearer ' + token;
		        authConfig.bearerToken = token;
		        httpBuffer.retryAll(update);
		    }


		    function resetAuthToken() {
		        var deferred = $q.defer();
		        var $http = $injector.get("$http");
		        $http.post(authConfig.authRetryURL, {}).then(
					function (response) {
					    setAuthToken(response.data.d);
					    deferred.resolve();
					},
					function () {
					    deferred.reject();
					}
				);
		        return deferred.promise;
		    }

		    function update(item) {
		        item.headers.Authorization = 'bearer ' + authConfig.bearerToken;
		        return item;
		    }
		}
	]);
})();