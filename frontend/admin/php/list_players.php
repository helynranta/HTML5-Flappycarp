<?php
	include_once '../../php/include/functions.php';
	include_once 'authenticate.php';
	
	sec_session_start();	//start secure session

	$results = array(
		"result" => false,
		"players" => array()
		);

	if(admin_login_check())
	{
		$db = new PDO('sqlite:../../db/users.sqlite');
	    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		if($stmt = $db->prepare("SELECT uid, username FROM users"))
		{
		    $stmt->execute();
		    $db = $stmt->fetchAll();
		    if($db != null)
		    {
		        foreach( $db as $row )
		        {
		        	$player = array();
		        	$player["username"] = $row["username"];
		        	$player["uid"] = $row["uid"];
		        	array_push($results["players"], $player);
		        }
		        $results['result']      = true;
		    } else {
		        $results['result']      = true;
		    }
		} else {
		    $results["error"] = "database error";
		}
	   
	} else {
		// the correct post variables were not sent
		$results["error"] = 'not logged in';
	}

    echo json_encode($results);
   
    $db = null;
    $stmt = null;
    exit();
	

?>