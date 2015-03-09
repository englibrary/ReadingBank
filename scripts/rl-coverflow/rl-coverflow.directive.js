angular.module('rl-coverflow')
	.directive('rlCoverflow', ['$window', '$document', '$compile', '$rootScope', '$interval', 'debounce', function ($window, $document, $compile, $rootScope, $interval, debounce) {
	    return {
	        restrict: 'EA',
	        scope: {
	            data: '=',
	            config: '=',
	            flowIndex: '=', //order on page
	            flowId: '=' //guid identifier
	        },
	        controller: ['$scope', function ($scope) {

	        } ],
	        template: '<div id="{{$index}}" class="content" ng-repeat="cover in data"></div>',
	        link: function (scope, element, attrs) {

	            var triggerInitDebounced;

	            scope.iterateChildren = function (data) {
	                var children = element.children();
	                var i, l, el, d, child;

	                for (i = 0, l = children.length; i < l; i++) {


	                    child = children[i];
	                    el = angular.element(child);
	                    d = data[i];

	                    if (!d) {
	                        break;
	                    }

	                    if (d.template) {
	                        var newScope = $rootScope.$new(true);
	                        newScope.book = data[i];

	                        newScope.flowId = scope.flowId;

	                        newScope.onCoverClick = function (flow, cover) {
	                            scope.$emit('rlCoverflow:coverClick', { flowIndex: flow, flowId: scope.flowId, bookIndex: cover });
	                        };

	                        var compiled = $compile(d.template)(newScope);
	                    } else if (scope.config.template) {
	                        var newScope = $rootScope.$new(true);
	                        newScope.data = d;
	                        var compiled = $compile(scope.config.template)(newScope);
	                    } else {
	                        throw new Error('No template specified');
	                    }

	                    if (scope.replaceTemplate) {
	                        el.replaceWith(compiled);
	                    } else {
	                        el.append(compiled);
	                    }
	                }
	            }


	            scope.wrap = function (x) {
	                return (x >= scope.count) ? (x % scope.count) : (x < 0) ? scope.wrap(scope.count + (x % scope.count)) : x;
	            };

	            scope.$watch('data', function (data) {
	                if (data) {
	                    scope.initialize();

	                    scope.iterateChildren(data);
	                    scope.covers = element.children();

	                    scope.coversArray = Array.prototype.slice.call(scope.covers);


	                    if (scope.showNavArrows && typeof $window.ontouchstart === 'undefined') {

	                        var leftArrow = angular.element("<div class='arrowLeft glyph glyph-chevron-previous'></div>");
	                        element.prepend(leftArrow);
	                        leftArrow.bind('mousedown', arrowClick);
	                        leftArrow.bind('mouseup', arrowRelease);

	                        var rightArrow = angular.element("<div class='arrowRight glyph glyph-chevron-next'></div>");
	                        element.append(rightArrow);
	                        rightArrow.bind('mousedown', arrowClick);
	                        rightArrow.bind('mouseup', arrowRelease);
	                    }

	                    angular.element($window).bind('resize', resize);
	                    scope.setupEvents();
	                    scope.addVendorTransform();

	                    scroll(scope.offset);

	                    triggerViewEvent();
	                }
	            });

	            scope.initialize = function () {
	                scope.pressed = scope.config.pressed || false;
	                scope.timeConstant = scope.config.timeConstant || 250; // ms
	                scope.dim = scope.config.dim || 200;
	                scope.offset = target = scope.config.offset || 0;
	                scope.angle = scope.config.angle || -60;
	                scope.dist = scope.config.dist || 150;
	                scope.shift = scope.config.shift || 0;
	                scope.translateXPercentage = 50;

	                scope.count = scope.data.length;
	                scope.maxCovers = scope.config.maxCovers || scope.count;


	                scope.keyScrollCount = scope.config.keyScrollCount || 1;
	                scope.showNavArrows = scope.config.showNavArrows || false;
	                scope.enableKeys = scope.config.enableKeys !== 'undefined' ? scope.config.enableKeys : true;

	                scope.scale = scope.config.scale || function () { return 1; };
	                scope.overlap = scope.config.overlap || 1;
	                scope.threeD = scope.config.has3d || false; // Turning off 3D results in IE9 support
	                scope.centerScale = scope.config.centerScale || 1;
	                scope.replaceTemplate = scope.config.replaceTemplate || false;

	                scope.isScaled = scope.scale() !== 1;
	                scope.has2d = scope.config.has2d || scope.browserHas2d();
	                scope.resizeDebounceTimer = scope.config.resizeDebounce || 500;

	                scope.reference;
	                scope.amplitude;
	                scope.target;
	                scope.velocity;
	                scope.frame;
	                scope.timestamp;
	                scope.ticker;
	                scope.hasMoved;

	                triggerInitDebounced = debounce(triggerViewEvent, scope.resizeDebounceTimer, false);

	                // IE8
	                Date.now = Date.now || function () { return +new Date; };
	                if (!Array.prototype.indexOf) {
	                    Array.prototype.indexOf = function (obj, start) {
	                        for (var i = (start || 0), j = this.length; i < j; i++) {
	                            if (this[i] === obj) { return i; }
	                        }
	                        return -1;
	                    }
	                }

	            }

	            

	            scope.addVendorTransform = function () {
	                scope.xform = 'transform';
	                angular.forEach(['-webkit-', 'Moz', 'O', 'ms', '-ms-'], function (prefix) {
	                    var e = prefix + 'transform';
	                    var doc = angular.element($document);
	                    if (typeof doc[0].body.style[e] !== 'undefined') {
	                        scope.xform = e;
	                        return false;
	                    }
	                    return true;
	                });
	            }

	            scope.setupEvents = function () {
	                if (scope.has2d) {
	                    if (typeof $window.ontouchstart !== 'undefined') {
	                        element.bind('touchstart', tap);
	                        element.bind('touchmove', drag);
	                        element.bind('touchend', release);
	                    }
	                    element.bind('mousedown', tap);
	                    element.bind('mousemove', drag);
	                    element.bind('mouseup', release);
	                    element.bind('mouseleave', blur);

	                    element.bind('dragstart', function (e) { e.preventDefault(); });

	                }

	                if (scope.enableKeys)
	                    $document.bind('keydown', handleKey);
	            }

	            scope.xpos = function (e) {
	                if (typeof $window.ontouchstart !== 'undefined') {// touch event 
	                    var touches = (typeof e.targetTouches !== "undefined") ? e.targetTouches : e.originalEvent.targetTouches;  //mobile along with including jQuery
	                    if (touches && (touches.length >= 1)) {
	                        return touches[0].clientX;
	                    }
	                }

	                // mouse event
	                return e.clientX;
	            }

	            scope.browserHas2d = function () {
	                var el = document.createElement('p'),
						has2d,
						transforms = {
						    'webkitTransform': '-webkit-transform',
						    'OTransform': '-o-transform',
						    'msTransform': '-ms-transform',
						    'MozTransform': '-moz-transform',
						    'transform': 'transform'
						};

	                // Add it to the body to get the computed style.
	                document.body.insertBefore(el, null);

	                for (var t in transforms) {
	                    if (el.style[t] !== undefined) {
	                        el.style[t] = "translate(200px, 100px) scale(.75, .75) rotate(40deg)";
	                        has2d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
	                    }
	                }

	                document.body.removeChild(el);
	                return (has2d !== undefined && has2d.length > 0 && has2d !== "none");
	            }

	            scope.$on('rlCoverflow:scrollTo', function (event, index) {
	                var coversToScroll = index - scope.center;

	                scope.keyScrollCount = coversToScroll;
	                clickScroll(coversToScroll > 0);

	                // TODO: take this off scope and make an argument of clickScroll so we don't have to reset it
	                scope.keyScrollCount = 1;
	            });

	            scope.$on('$destroy', function () {
	                $interval.cancel(scope.ticker);
	            });

	            function hideCovers() {
	                for (var i = 0; i < scope.coversArray.length; i++) {
	                    var el = angular.element(scope.coversArray[i]);
	                    el.attr('style', 'display: none;');
	                }
	            }

	            function scroll(x) {
	                var i, half, delta, dir, tween, el, alignment;
	                scope.offset = (typeof x === 'number') ? x : scope.offset;
	                center = Math.floor((scope.offset + scope.dim / 2) / scope.dim);
	                scope.center = center;
	                delta = scope.offset - center * scope.dim;
	                dir = (delta < 0) ? 1 : -1;
	                tween = -dir * delta * 2 / scope.dim;

	                if (tween > 0) {
	                    scope.hasMoved = true;
	                } else if (tween === 0 && scope.hasMoved) {
	                    scope.hasMoved = false;
	                    var visibleIndexes = determineVisibleCovers();
	                    scope.$emit('rlCoverflow:stop', { flowIndex: scope.flowIndex, flowId: scope.flowId, visibleIndexes: visibleIndexes, direction: scope.direction });
	                };

	                alignment = 'translateX(' + scope.translateXPercentage + '%)';

	                hideCovers();

	                half = scope.maxCovers >> 1;
	                for (i = 0; i <= half; ++i) {

	                    var scaled = scope.scale(i);
	                    var halfCardWidth = 195;
	                    var maxExtentX = 390 + scope.shift;
	                    var centerX = halfCardWidth + scope.shift;

	                    var rightTranslateX = (scope.shift + (scope.dim * i - delta) * scope.overlap) * scaled;
	                    var rightCardCenterX = rightTranslateX + halfCardWidth;
	                    var rightScaled = 1;
	                    if (scope.isScaled) {
	                        rightScaled = 1 - ((Math.abs(centerX - rightCardCenterX) / maxExtentX) * 0.4);
	                    }

	                    // center
	                    centerEl = angular.element(scope.covers).eq([scope.wrap(center)]);
	                    centerEl.addClass('center');
	                    centerEl.removeClass('left');
	                    centerEl.removeClass('right');
	                    centerEl.css('zIndex', 1);
	                    centerEl.css('display', '');

	                    // right side
	                    el = angular.element(scope.covers).eq([scope.wrap(center + i)]);
	                    var rightAlignment = alignment +
							' translateX(' + rightTranslateX + 'px)';
	                    if (scope.threeD) {
	                        rightAlignment = rightAlignment +
                                ' translateZ(0)' + ' scale(' + rightScaled + ',' + rightScaled + ') ';
	                        //' translateZ(' + scope.dist + 'px)';
	                        //' rotateY(' + scope.angle + 'deg)';
	                    } else {
	                        rightAlignment = rightAlignment + ' scale(' + rightScaled + ',' + rightScaled + ') ';
	                    }

	                    if (scope.has2d)
	                        el.css(scope.xform, rightAlignment);
	                    else //IE8
	                        el.css('left', rightTranslateX);

	                    el.css('zIndex', -i);
	                    el.css('opacity', (i === half && delta < 0) ? 1 - tween : 1);
	                    el.css('display', '');

	                    el.removeClass('left');
	                    el.removeClass('back');
	                    if (Math.abs(-i) < 3) {
	                        el.addClass('right');
	                    } else {
	                        el.addClass('back');
	                    }

	                    // left side
	                    var leftTranslateX = (-scope.shift + (-scope.dim * i - delta) * scope.overlap) * scaled;
	                    var leftCardCenterX = leftTranslateX + halfCardWidth;
	                    var leftScaled = 1;
	                    if (scope.isScaled) {
	                        leftScaled = 1 - ((Math.abs(centerX - leftCardCenterX) / 410) * 0.4);
	                    }

	                    el = angular.element(scope.covers).eq([scope.wrap(center - i)]);
	                    var leftAlignment = alignment +
							' translateX(' + leftTranslateX + 'px)';
	                    if (scope.threeD) {
	                        leftAlignment = leftAlignment +
                                ' translateZ(0)' + ' scale(' + leftScaled + ',' + leftScaled + ') ';
	                        //' translateZ(' + scope.dist + 'px)';
	                        //' rotateY(' + -scope.angle + 'deg)';
	                    } else {
	                        leftAlignment = leftAlignment + ' scale(' + leftScaled + ',' + leftScaled + ') ';
	                    }

	                    if (scope.has2d)
	                        el.css(scope.xform, leftAlignment);
	                    else//IE8
	                        el.css('left', leftTranslateX);

	                    el.css('zIndex', -i);
	                    el.css('opacity', (i === half && delta > 0) ? 1 - tween : 1);
	                    el.css('display', '');

	                    el.removeClass('right');
	                    el.removeClass('back');
	                    if (Math.abs(-i) < 3) {
	                        el.addClass('left');
	                    } else {
	                        el.addClass('back');
	                    }
	                }
	            }

	            function track() {
	                var now, elapsed, delta, v;

	                now = Date.now();
	                elapsed = now - scope.timestamp;
	                scope.timestamp = now;
	                delta = scope.offset - scope.frame;
	                setDirection(delta);
	                scope.frame = scope.offset;

	                v = 1000 * delta / (1 + elapsed);
	                scope.velocity = 0.8 * v + 0.2 * scope.velocity;
	            }

	            function autoScroll() {
	                var elapsed, delta;

	                if (scope.amplitude) {
	                    elapsed = Date.now() - scope.timestamp;
	                    delta = scope.amplitude * Math.exp(-elapsed / scope.timeConstant);
	                    if (delta > 4 || delta < -4) {
	                        scroll(scope.target - delta);
	                        requestAnimationFrame(autoScroll);
	                    } else {
	                        scroll(scope.target);
	                    }
	                }
	            }

	            function setDirection(delta) {
	                scope.direction = delta > 0 ? 1 : -1;
	            }

	            function clickScroll(isRight) {
	                setDirection(isRight);
	                // If `keyScrollCount` is negative, we want to add the resulting negative value to scope.offset,
	                // otherwise we'd be subtracting a negative (i.e. adding) and the coverflow will end up advancing to the wrong place

	                //Prevent the  coverflow from stopping between cards by rounding the offset to the nearest increment
	                var offsetRemainder = scope.offset % scope.dim;
	                if (offsetRemainder) {
	                    //round up if scrolling right, otherwise round down
	                    if (isRight) {
	                        scope.offset = scope.offset + (scope.dim - offsetRemainder);
	                    }
	                    else {
	                        scope.offset = scope.offset - offsetRemainder;
	                    }
	                }

	                if (isRight || scope.keyScrollCount < 0) {
	                    scope.target = scope.offset + scope.dim * scope.keyScrollCount;
	                }
	                else {
	                    scope.target = scope.offset - scope.dim * scope.keyScrollCount;
	                }

	                if (scope.offset !== scope.target) {
	                    scope.amplitude = scope.target - scope.offset;
	                    scope.timestamp = Date.now();
	                    requestAnimationFrame(autoScroll);
	                    return true;
	                }
	            }

	            function tap(e) {
	                scope.pressed = true;
	                scope.reference = scope.xpos(e);

	                scope.velocity = scope.amplitude = 0;
	                scope.frame = scope.offset;
	                scope.timestamp = Date.now();
	                $interval.cancel(scope.ticker);
	                scope.ticker = $interval(track, 100);
	            }

	            function drag(e) {

	                var x, delta;
	                if (scope.pressed) {
	                    x = scope.xpos(e);
	                    delta = scope.reference - x;
	                    if (delta > 2 || delta < -2) {
	                        scope.reference = x;
	                        setDirection(delta);
	                        scroll(scope.offset + delta);
	                    }
	                }

	                e.preventDefault(); //here because iPad is dragging around still.
	                e.stopPropagation();
	                return false;

	            }

	            function blur(e) {
	                scope.pressed = false;

	                $interval.cancel(scope.ticker);
	            }

	            function release(e) {
	                scope.pressed = false;

	                $interval.cancel(scope.ticker);
	                scope.target = scope.offset;
	                if (scope.velocity > 10 || scope.velocity < -10) {
	                    scope.amplitude = 0.9 * scope.velocity;
	                    scope.target = scope.offset + scope.amplitude;
	                }

	                scope.target = Math.round(scope.target / scope.dim) * scope.dim;
	                scope.amplitude = scope.target - scope.offset;
	                scope.timestamp = Date.now();
	                requestAnimationFrame(autoScroll);

	            }

	            function handleKey(e) {
	                if (!scope.pressed && (scope.target === scope.offset)) {
	                    e.which = e.which ? e.which : e.keyCode;  //ie8
	                    var isScrollRight;
	                    // Space or PageDown or RightArrow or DownArrow
	                    if ([32, 34, 39, 40].indexOf(e.which) >= 0) {
	                        isScrollRight = true;
	                    }
	                    // PageUp or LeftArrow or UpArrow
	                    if ([33, 37, 38].indexOf(e.which) >= 0) {
	                        isScrollRight = false
	                    }
	                    clickScroll(isScrollRight);
	                }
	            }

	            function arrowClick(e) {
	                scope.pressed = false;
	                $interval.cancel(scope.ticker);
	                var isScrollRight;
	                if (angular.element((e.currentTarget) ? e.currentTarget : e.srcElement).hasClass("arrowRight"))
	                    isScrollRight = true;
	                else
	                    isScrollRight = false;
	                clickScroll(isScrollRight);
	                e.preventDefault();
	                e.stopPropagation();
	                return false;
	            }

	            function arrowRelease(e) {
	                e.preventDefault();
	                e.stopPropagation();
	                return false;
	            }

	            function resize() {
	                //scroll();

	                triggerInitDebounced();
	            }

	            function triggerViewEvent() {
	                var visibleIndexes = determineVisibleCovers();
	                scope.$emit('rlCoverflow:view', { flowIndex: scope.flowIndex, flowId: scope.flowId, visibleIndexes: visibleIndexes });
	            }

	            function determineVisibleCovers() {
	                if (!scope.covers || scope.covers.length < 0) return [];

	                var viewportEl = angular.element(element);
	                var coverEl = angular.element(scope.covers[0]);
	                var coverWidth = coverEl.width();
	                var viewportWidth = viewportEl.width();
	                var coverAndMarginWidth = scope.dim * scope.overlap;
	                var visibleCovers = Math.floor(viewportWidth / coverAndMarginWidth);
	                var partialFirstCoverWidth = scope.dim / 2 * scope.overlap;
	                var margin = coverAndMarginWidth - 100;
	                var remainingSpace = viewportWidth - visibleCovers * coverAndMarginWidth;

	                if (remainingSpace - partialFirstCoverWidth > margin) {
	                    visibleCovers += 2; //add half cover and any remainder
	                }
	                else if (partialFirstCoverWidth > 0) {
	                    visibleCovers++; //add half first cover
	                }

	                var visibleIndexes = [];
	                for (var i = scope.center - 1; i < scope.center + visibleCovers - 1; i++) {
	                    visibleIndexes.push(scope.wrap(i));
	                }
	                return visibleIndexes;
	            }
	        }
	    }
	} ]);