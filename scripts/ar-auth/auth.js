(function () {

    'use strict';


    angular.module('ar-auth', ['ar-core']);

    angular.module('ar-auth').run(run);
    angular.module('ar-auth').config(config);

    run.$inject = ['authorizationSvc', 'authConfig', 'userContext', '$http', '$rootScope'];
    config.$inject = ['$httpProvider'];

    function run(authorizationSvc, authConfig, userContext, $http, $rootScope) {
        authorizationSvc.setAuthToken(authConfig.bearerToken);

        $rootScope.$on('rl:auth-required', function () {
            authorizationSvc.resetAuthToken();
        });

        $http.defaults.headers.common['RLI-ClientId'] = userContext.clientId;
    }

    function config($httpProvider) {
        $httpProvider.interceptors.push('responseInterceptor');

    }


})();