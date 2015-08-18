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
/*
	LOGIN SCRIPT!
*/
function login($name, $password, $results)
{
	$db = new PDO('sqlite:../../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	if($stmt = $db->prepare("SELECT uid, username, pwhash, salt, ban FROM users WHERE username = ? LIMIT 1"))
	{
		$stmt->bindParam('1',$name);
		$stmt->execute();
		//$stmt->store_result();
		//get variables from result
		//$stmt->bind_result($user_id, $username, $db_password, $salt);
		$row = $stmt->fetch();
		//hash the password with unique salt
		
		if($row)
		{
			$user_id = $row[0];
			$username = $row[1];
			$db_password = $row[2];
			$salt = $row[3];
			$ban = $row[4];
			$password = hash('sha512', $password . $row[3]);
			if($ban == 1)
			{
				$results['cause'] = "ban";
				return $results; 
			} 
			//check if pswrd matches 
			if($db_password == $password)
			{
				//get user-agent string
				$user_browser = $_SERVER['HTTP_USER_AGENT'];
				//xss protection as we might print this value
				$user_id = preg_replace("/[^0-9]+/", "", $user_id);
				$_SESSION['user_id'] = $user_id;
				//xss protection as we might print this value
				$username = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $username);
				$_SESSION['username'] = $username;
				$_SESSION['login_string'] = hash('sha512', $password . $user_browser);
				//LOGIN SUCCESSFUL!
				
				
				$results['result'] = true;
			
				return $results; 
			}
			else
			{
				//PASSWORD NOT CORRECT
				return $results;
			}
		}else
		{
			//no user exists
			//echo "no user exists";
			return $results;
		}
	} else {
		//echo "database error";
		return $results;
	}
}
/*
	CHECK IF LOG IN
*/
function login_check($db)
{
 
	sec_session_start();
	//check if all session variables are set
	if(isset($_SESSION['user_id'], $_SESSION['username'], $_SESSION['login_string']))
	{
		$user_id 		= 	$_SESSION['user_id'];
		$login_string 	= 	$_SESSION['login_string'];
		$username 		= 	$_SESSION['username'];

		//get user-agent
		$user_browser 	= 	$_SERVER['HTTP_USER_AGENT'];

		if($stmt = $db->prepare("SELECT pwhash FROM users WHERE uid = ? LIMIT 1;"))
		{
			$stmt->bindParam("1", $user_id);
			$stmt->execute();
			
			$row = $stmt->fetch();
			if(strlen($row[0])>0)
			{
				$password = $row[0];
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
		} else {
			return false;
		}
	} else {
		return false;
	}
}
/*
	Sanitize output from php_self
	!!to be read: http://awordpress.net/blog/dangers-in-using-php_self/
	prevents from attacks
*/
function esc_url($url)
{
	if('' == $url){
		return $url;
	}

	$url = preg_replace('|[^a-z0-9-~+_.?#=!&;,/:%@$\|*\'()\\x80-\\xff]|i', '', $url);

	$strip = array('%0d', '%0a', '%0D', '%0A');
    $url = (string) $url;
 
    $count = 1;
    while ($count) {
        $url = str_replace($strip, '', $url, $count);
    }
 
    $url = str_replace(';//', '://', $url);
 
    $url = htmlentities($url);
 
    $url = str_replace('&amp;', '&#038;', $url);
    $url = str_replace("'", '&#039;', $url);
 
    if ($url[0] !== '/') {
        // We're only interested in relative links from $_SERVER['PHP_SELF']
        return '';
    } else {
        return $url;
    }
}

if(isset($_POST["type"]))
{
	$db = new PDO('sqlite:../../db/users.sqlite');
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	if($_POST["type"] == "check_login"){
		if(!login_check($db)) 
			echo "false";
		else 
			echo $_SESSION["username"];
		$_POST["type"]="";
		exit();
	}
	if($_POST["type"] == "get_username")
	{
		sec_session_start();
		echo $_SESSION['username'];
		$_POST["type"]="";
		exit();
	}
	
	$_POST["type"]="";
	$db = null;
	$stmt = null;
}

?>