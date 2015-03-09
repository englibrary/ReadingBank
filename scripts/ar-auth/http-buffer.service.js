(function () {
    'use strict';

    angular
        .module('ar-auth')
        .factory('httpBuffer', httpBuffer);

    httpBuffer.$inject = ['$injector'];

    function httpBuffer($injector){
        /** Holds all the requests, so they can be re-requested in future. */
        var buffer = [];

        /** Service initialized later because of circular dependency problem. */
        var $http;

        function retryHttpRequest(config, deferred) {
            function successCallback(response) {
                deferred.resolve(response);
            }
            function errorCallback(response) {
                deferred.reject(response);
            }
            $http = $http || $injector.get('$http');
            $http(config).then(successCallback, errorCallback);
        }

        return {

            retryHttpRequest: retryHttpRequest,

            /**
            * Appends HTTP request configuration object with deferred response attached to buffer.
            */
            append: function (config, deferred) {
                buffer.push({
                    config: config,
                    deferred: deferred
                });
            },

            /**
            * Abandon or reject (if reason provided) all the buffered requests.
            */
            rejectAll: function (reason) {
                if (reason) {
                    for (var i = 0; i < buffer.length; ++i) {
                        buffer[i].deferred.reject(reason);
                    }
                }
                buffer = [];
            },

            /**
            * Retries all the buffered requests clears the buffer.
            */
            retryAll: function (update) {
                for (var i = 0; i < buffer.length; ++i) {
                    retryHttpRequest(update(buffer[i].config), buffer[i].deferred);
                }
                buffer = [];
            }
        };
    }

})();
