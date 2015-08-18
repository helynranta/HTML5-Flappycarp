<?php

	include_once 'include/functions.php';
	include_once '../admin/php/authenticate.php';

	$results = array (
		'result' => false
	);
	
	$db = new PDO('sqlite:../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


	if(login_check($db) || admin_login_check())
	{
		if(admin_login_check() && isset($_POST['user_id'])){
	    	$user_id = $_POST['user_id'];
	    	$results['uid'] = $user_id;
		}
	    else if ( isset($_SESSION['user_id']))
	    	$user_id = $_SESSION['user_id'];
	    else
	    	$results['error'] = 'unkown';

		if(isset($_POST['race'], $_POST['religion'], $_POST['home']))
		{
			if($stmt = $db->prepare("SELECT * FROM info WHERE uid = ?"))
			{
				$stmt->bindParam('1',$user_id);
	            $stmt->execute();
	            $row = $stmt->fetchAll();
	            
	            if($row != null)
	            {
					if($insert_stmt = $db->prepare("UPDATE info SET race = ?, religion = ?,  home = ? where uid = ?"))
			        {

			            $insert_stmt->bindParam('1',$_POST['race']);
			            $insert_stmt->bindParam('2',$_POST['religion']);
			            $insert_stmt->bindParam('3',$_POST['home']);
			            $insert_stmt->bindParam('4',$user_id);
			            if($insert_stmt->execute())
			            {
			            	$results['race'] = $_POST['race'];
							$results['religion'] = $_POST['religion'];
							$results['home'] = $_POST['home'];
							$results['result'] = true;
			            } else {
			            	$results["error"] = "database error: insert";
			            }
			        } else {
			            $results["error"] = "database error: prepare";
			        }
			    } else {
			    	if($insert_stmt = $db->prepare("INSERT INTO info (race, religion, home, uid) VALUES (?,?,?,?)"))
			        {

			            $insert_stmt->bindParam('1',$_POST['race']);
			            $insert_stmt->bindParam('2',$_POST['religion']);
			            $insert_stmt->bindParam('3',$_POST['home']);
			            $insert_stmt->bindParam('4',$user_id);
			            if($insert_stmt->execute())
			            {
			            	$results['race'] = $_POST['race'];
							$results['religion'] = $_POST['religion'];
							$results['home'] = $_POST['home'];
							$results['result'] = true;
			            } else {
			            	$results["error"] = "database error: insert";
			            }
			        } else {
			            $results["error"] = "database error: prepare";
			        }
			    }
			} else {
	            $results["error"] = "database error: select";
	        }
		} else {
			$results['error'] = 'post not set';
		}
	} else {
		$results['error'] = 'must login';
	}
	
	echo json_encode($results);
	$db = null;
    $stmt = null;
    exit();
?>