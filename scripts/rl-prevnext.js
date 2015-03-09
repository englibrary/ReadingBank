angular.module('rl-prevnext', [])
	.directive('rlPrevnext', ['$document', function ($document) {
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				maxpages: '@',
				callback: '&'
			},
			controller: ['$scope', function ($scope) {

			} ],
			templateUrl: "../scripts/lib/rl-prevnext/rl-prevnext.html",
			link: function (scope, element, attrs) {
				scope.$watch('maxpages', function (maxpages) {
					if (maxpages) {
						scope.initialize();
					}
				});

				scope.initialize = function () {
					scope.maxPage = scope.maxpages || 1;
					scope.currentPage = 1;
				}

				$document.bind('keydown', handleKey);
				scope.searchPrevClick = function () {
					if (scope.currentPage > 1) {
						scope.currentPage--;
						scope.callback({ e: scope.currentPage });
					}
				}

				scope.searchNextClick = function () {
					if (scope.currentPage < scope.maxPage) {
						scope.currentPage++;
						scope.callback({ e: scope.currentPage });
					}
				}

				function handleKey(e) {
					e.which = e.which ? e.which : e.keyCode;  //ie8
					if ([37, 39].indexOf(e.which) >= 0) {
						if ([37].indexOf(e.which) >= 0)
							scope.searchPrevClick();
						if ([39].indexOf(e.which) >= 0)
							scope.searchNextClick();
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				}
			}
		}
	} ]);