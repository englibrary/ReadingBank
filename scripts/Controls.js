if($){
	(function($){
		$.fn.collapsible = function(params){
			return this.each(function(){
				var content = $(this);
				var handler = function(){
					if (content.is(":visible")){
						content.hide();
						params.expandedImg.hide();
						params.collapsedImg.show();
					}
					else{
						content.show();
						params.expandedImg.show();
						params.collapsedImg.hide();
					}
				}
				params.expandedImg.click(handler);
				params.collapsedImg.click(handler);
			});
		};
	})($);

    // Note:  This checkSoftware() function does not appear to be used anymore.  It was used in the past to display an Alert to the
    //        user if there OS/Browser was not supported.  It appears that the alert that was displayed to the user was removed as part 
    //        of the Facelift project in 2013. The file that needs to change now is \OCW\Public\RPM\DetectPlugin\MinimumRequirements.xml
    //        See Work Ticket 81165 for more details or talk to Vance B. or Kent K.
	function checkSoftware(requirements){
		//used when a version expression is specified in a requirement. gets the version immediately after the id.
		var defaultVersion = "(?:\\s|\\/)(\\d+(?:\\.\\d+)+(?:(?:a|b)\\d*)?)";

		if(requirements === undefined){
			requirements = '[{"type":"browser", "id":"MSIE", "min":"7", "max":"10.x"},' + 
							'{"type":"browser", "id":"Firefox", "min":"4"},' + 
                            '{"type":"browser", "id":"Chrome", "min":"23"},' + 
							'{"type":"browser", "id":"Apple", "min":"3", "max":"6.x", "version":"Version/(.*?)Safari"},' +
							'{"type":"os", "id":"Windows", "min":"5.1", "max":"6.2", "version":"Windows NT (.*?)[;)]"},' +
							'{"type":"os", "id":"Macintosh", "min":"10.4", "max":"10.8", "version":"Mac OS X (.*?)[;)]"},' +
							'{"type":"os", "id":"Mac_PowerPC", "min":"10.4", "max":"10.5", "version":"Mac OS X (.*?)[;)]"},' +
							'{"type":"plugin", "id":"flash", "min":"10"}]';
		}

		var required = [];
		var passed = [];
		
		var parsedRequirements = $.parseJSON(requirements);
		$.each(parsedRequirements, function(){
			if($.inArray(this.type, required) === -1){
				required.push(this.type);
			}

			var version = '';
			if(this.type === 'plugin'){
				if(this.id === 'flash'){
					version = getFlashVersion();
				}
			}
			else{
				if(new RegExp(this.id).test(navigator.userAgent)){
					var versionExp = this.version != undefined ? this.version : this.id + defaultVersion;
					var result = navigator.userAgent.match(new RegExp(versionExp));
					version = result != undefined ? result[1] : '';
				}
			}

			if(version !== '' && passesRequirement(version, this.min, this.max) && $.inArray(this.type, passed) === -1){
				passed.push(this.type);
			}
		});
		return (required.length === passed.length);
	}

	function passesRequirement(version, min, max) {
		version = version.replace(/_/g, '.');
		if(max !== undefined && max.indexOf('.x') !== -1 && version.indexOf('.') !== -1){
			version = version.substring(0, version.indexOf('.'));
		}

		version = parseFloat(version);
		min = parseFloat(min);
		if (max !== undefined) {
		max = parseFloat(max);
		}

		if(isNaN(version) || version < min || (version != undefined && version > max)){
			return false;
		}
		return true;
	}

	function getFlashVersion(){
		var flashVersion = '';
		if (new RegExp('MSIE').test(navigator.userAgent) && new RegExp('Win').test(navigator.userAgent)) {
			try{
				var obj = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				if(obj !== null){
					flashVersion = obj.GetVariable('$version').replace(/^.*?([0-9]+),([0-9]+).*$/, '$1.$2');
				}
			} catch(ex){}
		}
		else {
			$.each(navigator.plugins,function(){
				var plugin = this.description.split(" "); //[0]Shockwave [1]Flash [2]6.0 [3]r21 
				if(plugin[0] === 'Shockwave' && plugin[1] === 'Flash'){
					flashVersion = plugin[2];
					return;
				}
			});
		}
		return flashVersion;
	}

	function getScreenResolution(){
		return screen.width + 'x' + screen.height;
	}

	function getBrowserResolution(){
		return $(document).width() + 'x' + $(document).height();
	}

	function LaunchPopUpWindow(inURL, inUniqueID, inWidth, inHeight, inShowMenu){
		var width = inWidth != '0' ? inWidth : parseInt(screen.availWidth * .75);
		var height = inHeight != '0' ? inHeight : parseInt(screen.availHeight * .75);
		var showMenu = inShowMenu == 'True' ? 'yes' : 'no';
		var aChildWin = window.open(inURL,inUniqueID,'height=' + height + ',width=' + width + ',hotkeys=no,dependent=no,menubar=' + showMenu + ',resizable=yes,location=no,directories=no,titlebar=no,toolbar=no,scrollbars=yes');	
		aChildWin.focus();
	}

	function getOuterHTML($element){
		return $element.wrap('<p>').parent().html();
	}

	function watermark(){
		$(".watermark").focus(function () {
			$txt = $(this);
			if ($txt.val() === this.title) {
				$txt.val("");
				$txt.removeClass("watermark");
			}
		});

		$(".watermark").blur(function () {
			$txt = $(this);
			if ($.trim($txt.val()) === "") {
				$txt.val(this.title);
				$txt.addClass("watermark");
			}
		});

		$(".watermarkOff").blur(function () {
			$txt = $(this);
			if ($.trim($txt.val()) === "") {
				$txt.val(this.title);
				$txt.removeClass("watermarkOff");
				$txt.addClass("watermark");

				$(this).focus(function () {
					$txt = $(this);
					if ($txt.val() === this.title) {
						$txt.val("");
						$txt.removeClass("watermark");
					}
				});
			}
		});
	}

	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.search);
		if (results == null)
			return "";
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

$(function () {
    $("a.disabledHeader, a.disabledText").click(function () {
        // return false to disable the link (preventDefault = true)
        return false;
    });
});

jQuery.fn.outerHTML = function () {
    return jQuery('<li />').append(this.eq(0).clone()).html();
};

$(document).ready(function () {
    function hasSubList(className) {
        "use strict";
        $('.' + className).parent('li').addClass(className + 'Li');
    }

    function linkClassToLI(className) {
        "use strict";
        $('.' + className + 'Link').closest('li').addClass(className + 'Li');
        $('.' + className + 'Link').removeClass(className + 'Link');
    }

    linkClassToLI('inner');
    linkClassToLI('fly');
    linkClassToLI('sub');

    function createFlyMenu() {
        "use strict";
        $('.innerMenu').find('.innerLi').append('<ul class="flyMenu"></ul>');
        hasSubList('flyMenu');


        $('.innerMenu').find('.subLi').each(function () {
            var thisHTML = $(this).outerHTML();

            if ($(this).prevAll('.flyLi:first').find('ul').hasClass('subFly') !== true) {
                $(this).prevAll('.flyLi:first').append('<ul class="subFly"></ul>');
                hasSubList('subFly');
            }

            $(this).prevAll('.subFlyLi:first').find('.subFly').append(thisHTML);
            $(this).remove();
        });

        $('.innerMenu').find('.flyLi').each(function () {
            var thisHTML = $(this).outerHTML();
            $(this).prev('.flyMenuLi:first').find('.flyMenu').append(thisHTML);
            $(this).remove();
        });

    }

    createFlyMenu();

    function lastListItem(className) {
        "use strict";
        $('.' + className).each(function () {
            $(this).children('li').last().addClass('last');
        });
    }

    lastListItem('innerMenu');
    lastListItem('flyMenu');
    lastListItem('subFly');

    function hiddenNav(className, subClass) {
        "use strict";
        $('.' + className).find('li').on('mouseenter', function () {
            $(this).find('.' + subClass).show();
        });
        $('.' + className).find('li').on('mouseleave', function () {
            $(this).find('.' + subClass).hide();
        });
    }

    hiddenNav('innerMenu', 'flyMenu');
    hiddenNav('flyMenu', 'subFly');

    function sameArrowColor() {
        "use strict";
        $('.innerMenu').children('li').each(function () {
            var subFly = $(this).parent().find('.flyMenu').find('.subFlyLi');

            if ($(this).hasClass('kwMenuListItem')) {
                $(subFly).addClass('kwMenuListItem');
            }
            else if ($(this).hasClass('readingMenuListItem')) {
                $(subFly).addClass('readingMenuListItem');
            }
            else if ($(this).hasClass('mathMenuListItem')) {
                $(subFly).addClass('mathMenuListItem');
            }
            else if ($(this).hasClass('rpMenuListItem')) {
                $(subFly).addClass('rpMenuListItem');
            }
        });
    }

    sameArrowColor();

});