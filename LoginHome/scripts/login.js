/**
 * @author Administrator
 */

$(document).ready(function(){
	
	
		$('#btnLogIn').click(function() { 
			
			// this.form.submit();
		 	 //	   alert("length > 0");
		 	$.getJSON("UserAuthentification.php?action=Authentification",function(json) {
		 	 		
		 	//	 alert("Before length");
		 		if(json.users.length>0) {
				
			//	   alert("users > 0");
				    $.each(json.users,function(){
					
					var info = '<li> Name : '+ this['user']+ ' ' + this['password'] ;
					alert(info);
					
					location.href="./search.html";
				   } );
				
				} else {
					var info = "<div id='divAlert' class='login-row text-center style-radius'>";
			    	
			    	info +="<span class='glyph glyph-warning2'></span>";
			    	info +="<span id='ctl00_cp_Content_spAlert'>You have entered an invalid user name or password. If you have forgotten your user name or password, please see your teacher or administrator.</span>"; 
					$(".wrapper-inner").append(info);
					
				} //End of if(json)
				
				
		 	} // End of function
		 ); // End of getJSON
		});
		
  
        
});
