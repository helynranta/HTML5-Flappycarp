<?php
	include_once 'authenticate.php';
	include_once '../../php/include/functions.php';
	
	sec_session_start();	//start secure session

	$results = array(
		"result" => false
		);

	if(isset($_POST['username'], $_POST['password']))
	{
		$username = $_POST['username'];
		$password = $_POST['password']; //THIS IS HASHED PSWD

		$results["username"] = $_POST['username'];
	    $results['password'] = $_POST['password'];
		
		if(admin_login($username, $password) == false){
			$results["error"] = "login crediterials invalid";
		} else {
			$results["result"] = true;
		}
		
	} else {
		// the correct post variables were not sent
		$results["error"] = 'no post set';
	}

	echo json_encode($results);

	exit();
?>