<?php
	$_POST["type"] = "";
	include_once 'functions.php';
	$results = array (
		"result" => false,
		"cause" => "error"
		);
	sec_session_start();	//start secure session
	
	if(isset($_POST['username'], $_POST['p']))
	{
		$username = $_POST['username'];
		$password = $_POST['p']; //THIS IS HASHED PSWD
		$results = login($username, $password, $results);
		if(!$results['result']){
			if($results['cause'] != "ban")
				$results['error'] = "login crediterials invalid";
			else
				$results['error'] = "username has been banned";
		} else {
			$results['username'] = $_SESSION['username'];
			$results['result'] = true;
		}
	} else 
	{
		// the correct post variables were not sent
		$results['error'] = '0, invalid request';
	}
	echo json_encode($results);
	exit(0);
?>