(function() {
    'use strict';

    angular
        .module('rl-coverflow')
        .directive('rlBookCover', rl_book_cover);

    rl_book_cover.$inject = ['$window'];

    function rl_book_cover($window) {
        // Usage:
        //     <rl_book_cover></rl_book_cover>
        // Creates:
        // 
        var directive = {
            link: link,
            restrict: 'EA',
            templateUrl: '../scripts/custom/rl-coverflow/templates/cover-flow-book.html'
            
        };
        return directive;

        function link(scope, element, attrs) {
            
        }

 
 
}

})();