var a_Win = false;
var a_IE = false;
var a_Safari = false;
var a_Netscape = false;

SetupBrowserVars();

function SetupBrowserVars(){
	a_IE = navigator.userAgent.indexOf("MSIE") > -1 ? true:false;
	a_Win = navigator.platform.indexOf("Win") > -1 ? true:false;
	a_Safari = navigator.userAgent.indexOf("Safari") > -1 ? true:false;
	a_Netscape = navigator.userAgent.indexOf("Netscape") > -1 ? true:false;
}

function ExpandHelp( in_URL ){
	if (top) { 
		launchHelpWindow(in_URL, top); }
}

function ShrinkHelp( in_WindowToClose ){
	if (top) { 
		closeHelpWindow( in_WindowToClose, top ); }
}

function launchHelpWindow( in_URL, in_Window ) {
	if (screen) {
		var a_Width = screen.availWidth;
			var a_Height = screen.availHeight;
		var a_HelpWidth = Math.round( a_Width / 4 );
			in_Window.moveTo(0,0);
		in_Window.resizeTo( a_Width - a_HelpWidth - 1, a_Height );

		if( (a_IE && a_Win) || a_Safari ){
			var a_HelpWin = window.open( in_URL ,'HelpWin','hotkeys=no,dependent=yes,menubar=no,resizable=yes,location=no,directories=no,titlebar=no,toolbar=no,scrollbars=yes' );
			a_HelpWin.resizeTo( a_HelpWidth, a_Height );
			a_HelpWin.moveTo( a_Width - a_HelpWidth , 0 );
		}
		else if (a_IE) { 
			window.open(in_URL, 'HelpWin', 'width=' + (a_HelpWidth - 22) + ',height=' + a_Height + ',left=' + (a_Width - a_HelpWidth + 10) + ',top=0,hotkeys=no,dependent=yes,menubar=no,resizable=yes,location=no,directories=no,titlebar=no,toolbar=no,scrollbars=yes'); }
		else if (a_Netscape) {
			window.open( in_URL ,'HelpWin','screenX=' + (a_Width - a_HelpWidth ) + ',screenY=0,outerWidth=' + a_HelpWidth + ',outerHeight=' + (a_Height - 20) + ',hotkeys=no,location=no,dependent=no,menubar=no,resizable=yes,titlebar=no,toolbar=no,scrollbars=yes' );}
		else {
			window.open( in_URL ,'HelpWin','screenX=' + (a_Width - a_HelpWidth ) + ',screenY=0,outerWidth=' + a_HelpWidth + ',outerHeight=' + (a_Height - 20) + ',hotkeys=no,location=no,dependent=yes,menubar=no,resizable=yes,titlebar=no,toolbar=no,scrollbars=yes' );}
	}
}

function closeHelpWindow( in_WindowToClose, in_MainWindow ){
	if (screen) {
		in_MainWindow.moveTo(0,0);
		in_MainWindow.resizeTo( screen.availWidth, screen.availHeight );
	}  
	if( in_WindowToClose ){
		in_WindowToClose.close();
	}
}

function resizeCoverImage(wrapper_div, cheat_div, img_width, img_height) {
	var img = $(cheat_div).find('img');
	var img_ratio = img_width / img_height;

	$(cheat_div).css('width', $(wrapper_div).outerWidth());
	$(cheat_div).css('height', $(wrapper_div).outerHeight());

	$(img).css('width', $(cheat_div).width());
	$(img).css('height', $(cheat_div).height());

	var div_ratio = $(cheat_div).width() / $(cheat_div).height();

	if (div_ratio < img_ratio) {
		$(img).css('min-width', ($(cheat_div).height() / img_height) * img_width);
		$(img).css('margin-left', ($(img).width() - $(cheat_div).width()) / 2 * -1);
	} else {
		$(img).css('height', ($(cheat_div).width() / img_width) * img_height);
		$(img).css('margin-left', 0);
	}
}

function setupCoverImageCheat(wrapper_div, cheat_div, img_width, img_height) {
	if ($(cheat_div).length > 0) {
		$(window).resize(function () {
			resizeCoverImage(wrapper_div, cheat_div, img_width, img_height);
		});
		resizeCoverImage(wrapper_div, cheat_div, img_width, img_height);
	}
}