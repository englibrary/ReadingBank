<?php
 
if($_GET){
	
if($_GET['action'] == 'Authentification'){
		// $query = "SELECT first_name, last_name, gender, finish_time FROM runners order by finish_time ASC ";
		// $result = db_connection($query);
		
		$loginusers = array();

        array_push($loginusers, array('user' => 'kim', 'password' => 'pass'));
	   	array_push($loginusers, array('user' => 'lee', 'password' => 'pass1'));
		
		echo json_encode(array("users" => $loginusers));
		exit;
}	
}// End of GET
 
?>