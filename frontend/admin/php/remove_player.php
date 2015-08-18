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
	if(isset($_POST['user_id']))
	{
		$results["result"] = true;
		$db = new PDO('sqlite:../../db/users.sqlite');
	    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		if($stmt = $db->prepare("DELETE FROM users WHERE uid = ?"))
		{
			$stmt->bindParam("1", $_POST['user_id']);
		    $stmt->execute();
		} else {
		    $results["error"] = "database error";
		    $results["result"] = false;
		}
		if($stmt = $db->prepare("DELETE FROM info WHERE uid = ?"))
		{
			$stmt->bindParam("1", $_POST['user_id']);
		    $stmt->execute();
		} else {
		    $results["error"] = "database error";
		    $results["result"] = false;
		}
		if($stmt = $db->prepare("DELETE FROM stats WHERE uid = ?"))
		{
			$stmt->bindParam("1", $_POST['user_id']);
		    $stmt->execute();
		} else {
		    $results["error"] = "database error";
		    $results["result"] = false;
		}
	  } else {
	  	$results["error"] = 'post not set';
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