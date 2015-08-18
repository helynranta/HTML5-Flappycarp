<?php
	include_once 'psl-config.php';

	$error_msg = "";

	$db = new PDO('sqlite:../../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	if(isset($_POST['username'], $_POST['p']))
	{
		//sanitize and validate the data passed in
		$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
		$password = filter_input(INPUT_POST, 'p', FILTER_SANITIZE_STRING);

		if(strlen($password) != 128)
		{
			$error_msg .= '<p class="error">Invalid password configuration.</p>';
		}
		//check for existing username
		$stmt = $db->prepare("SELECT uid FROM users WHERE username = ? LIMIT 1;");
		$stmt->bindParam('1', $username);
		$stmt->execute();
		$row = $stmt->fetch();
		if(strlen($row[0]) > 0)
		{
			$error_msg .= '<p class="error">A user with this username already exists</p>';
		}
		//TODO OTHER CHECKS THAT ARE NEEDED

		if(empty($error_msg))
		{
			//create a random salt
			$random_salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
			//create salted password
			$password = hash('sha512', $password . $random_salt);
			//insert new user into database
			if($insert_stmt = $db->prepare("INSERT INTO users (username, pwhash, salt, highscore) VALUES (?,?,?,0.0)"))
			{
				$insert_stmt->bindParam('1', $username);
				$insert_stmt->bindParam('2', $password);
				$insert_stmt->bindParam('3', $random_salt);

				if(!$insert_stmt->execute())
				{
					//header('location: ../error.php?err=Registration failure: INSERT');
					$error_msg .= "<p class='error'>Registration failure: INSERT</p>";
				}
			}
		}
	}
	else {
		$error_msg .= "<p class='error'>Registration failure: POST</p>";
	}
	$stmt = null;
	$db = null;
	echo $error_msg;
	exit(0);
?>