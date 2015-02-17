<?php
  //create short names for variables
  $name = $_POST['ctl00$cp_Content$tbUserName'];
  $password = $_POST['ctl00$cp_Content$tbPassword'];

  if ((!isset($name)) || (!isset($password))) {
    //Visitor needs to enter a name and password

  } else if(($name=="user") && ($password=="pass")) {
    // visitor's name and password combination are correct
    //echo "<h1>Here it is!</h1>
     //     <p>I bet you are glad you can see this secret page.</p>";
		  
?>
<link href="master.css" rel="stylesheet" type="text/css" /> 
<div style="width:80%; padding:0% 10%; display:inline-block; text-align:center;">
		   <div id="search" style="padding:1em 0em 2em; text-align:center; position:relative; display:inline-block; white-space:nowrap;">
		   <div class="titleText" style="vertical-align:middle; display:inline-block;">Find a Book</div>
		   <input ng-model="searchVal" style="margin:5px; font-size:120%; vertical-align:middle; padding:2px" type="text" size="45" placeholder="Title, Author, or Quiz Number" />
			<input ng-click="currentPage=1; search(1)" class="posButton" type="button" value="Search" />
		   </div>  
		    
</div>
<?php
  } else {
    // visitor's name and password combination are not correct
    echo "<h1>Go Away!</h1>
          <p>You are not authorized to use this resource.</p>";
  }
?>
