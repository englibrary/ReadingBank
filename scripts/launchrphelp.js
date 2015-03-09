function LaunchRPHelp(app, culture, pageId)
{
	var url = "http://www.renaissance.com/asp/redir.asp?c=" + culture + "-help-" + app + "-" + pageId;
	var windowWidth = screen.width >= 960 ? 960 : screen.width * .9;
	var leftPosition = screen.width - windowWidth;
	var specs = "width=" + windowWidth + ",height=540,resizable=yes,status=yes,menubar=yes,scrollbars=1,top=0,left=" + leftPosition;
	
	window.open(url, "RPHelp", specs);
}