<?php
function sec_session_start()
{
	$session_name = 'sec_session_id';	//session name
	$secure = false;
	//this stops js being able to access the session id
	$httponly = true;
	//forces session to only use cookies.
	if(ini_set('session.use_only_cookies', 1) === FALSE)
	{
		echo "could not start secure session";
		exit();
	}

	//gets current cookies params
	$cookieParams = session_get_cookie_params();
	session_set_cookie_params($cookieParams['lifetime'],
		$cookieParams['path'],
		$cookieParams['domain'],
		$secure,
		$httponly);
	//sets the session name to the one set above
	session_name($session_name);

	session_start();
	session_regenerate_id();	//new id
	//echo "secure session started";
}
	
include_once 'authenticate.php';

sec_session_start();	//start secure session

$results = array(
	"result" => false
	);

if(admin_login_check())
{
	$results["result"] = true;	
} else {
	// the correct post variables were not sent
	$results["error"] = 'not logged in';
}

echo json_encode($results);

exit();

?>

