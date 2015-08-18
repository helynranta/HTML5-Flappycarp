<?php
/*
	LOGIN SCRIPT!
*/
function admin_login($username, $password)
{
	$db_password = "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86";
	//check if pswrd matches 
	if($db_password == $password && $username = "admin")
	{

		//get user-agent string
		$user_browser = $_SERVER['HTTP_USER_AGENT'];
		$_SESSION['username'] = "admin";
		$_SESSION['login_string'] = hash('sha512', $password . $user_browser);
		//LOGIN SUCCESSFUL!
		return true; 
	} else {
		return false;
	}
	
}
/*
	CHECK IF LOG IN
*/
function admin_login_check()
{
	//check if all session variables are set
	if(isset($_SESSION['username'], $_SESSION['login_string']))
	{
		$login_string 	= 	$_SESSION['login_string'];
		$user_browser 	= 	$_SERVER['HTTP_USER_AGENT'];
		$password = "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86";
		//if user exists get variables from result
		$login_check = hash('sha512', $password . $user_browser);
		if($login_check == $login_string)
		{
			//logged in
			return true;
		} else {
			return false;
		}	
	} else {
		return false;
	}
}
?>