(function () {
    'use strict';

    angular
        .module('rl-instrumentation')
		.factory('rlInstrumentationService', instrumentationService);

    instrumentationService.$inject = ['$resource', 'emsUrl', 'userContext'];

    function instrumentationService($resource, emsUrl, userContext) {
        var instrumentationResource = $resource(emsUrl);
        var service = {
            constructAndSendMessage: constructAndSendMessage,
            generateId: generateId
        };
        return service;

        function constructAndSendMessage(data, type, source) {
            if (!type) throw new Error("type required send instrumentation");
            if (!source) throw new Error("source required send instrumentation");

            var msg = {
                Id: generateId(),
                Source: source,
                Type: type,
                ClientId: userContext.clientId,
                SchoolId: userContext.schoolId,
                SessionId: userContext.sessionGuid,
                UserId: userContext.userId,
                ClassId: userContext.classId,
                Timestamp: (new Date()).toISOString(),
                Data: data
            };

            instrumentationResource.save(msg);
        }

        function generateId() {

            var time = new Date().getTime(), sixteen = 16;

            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (match) {
                var remainder = (time + sixteen * Math.random()) % sixteen | 0;
                time = Math.floor(time / sixteen);
                return (match == "x" ? remainder : remainder & 7 | 8).toString(sixteen);
            });
        }

    }

})();