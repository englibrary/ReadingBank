(function () {
    'use strict';

    angular
        .module('ar-auth')
        .factory('responseInterceptor', responseInterceptor);

        responseInterceptor.$inject = ['$injector', '$q', '$rootScope', 'httpBuffer']
        
        function responseInterceptor($injector, $q, $rootScope, httpBuffer) {
		    return {
		        responseError: function (response) {
		            if (response.status == 401 && !response.config.retried) {
		                var deferred = $q.defer();
		                response.config.retried = true;
		                httpBuffer.append(response.config, deferred);
		                $rootScope.$broadcast('rl:auth-required', response);
		                return deferred.promise;
		            }
		            else if (response.status >= 500 && response.status < 600 && !response.config.retried) {
		                var deferred = $q.defer();
		                response.config.retried = true;
		                httpBuffer.retryHttpRequest(response.config, deferred);
		                return deferred.promise;
		            }
		            $rootScope.$broadcast('applicationError');
		            return $q.reject(response);
		        },
		        response: function (response) {
		            $rootScope.resetAuthTokenAttempts = 0;
		            return response;
		        }
		    };
		}
})();