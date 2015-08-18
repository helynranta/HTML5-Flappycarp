<?php
	
	 $results = array(
        "result" => false,
        "error" => ""
        );

    include_once 'include/functions.php';
    
    $db = new PDO('sqlite:../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if(login_check($db))
    {
        if(isset($_POST['p'], $_POST['op']))
        {
            if($stmt = $db->prepare("SELECT pwhash, salt FROM users WHERE uid = ? LIMIT 1"))
            {
                $stmt->bindParam('1',$_SESSION['user_id']);
                $stmt->execute();
                $row = $stmt->fetchAll();
                //hash the password with unique salt
                
                if($row)
                {
                    $db_password = $row[0]['pwhash'];
                    $salt = $row[0]['salt'];
                    $password = hash('sha512', $_POST['op'] . $salt);
                    //check if pswrd matches 
                    if($db_password == $password)
                    {
                        //create a random salt
                        $random_salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
                        //create salted password
                        $password = hash('sha512', $_POST['p'] . $random_salt);
                        if($insert_stmt = $db->prepare("UPDATE users SET pwhash = ?, salt = ? WHERE uid = ?"))
                        {
                            $insert_stmt->bindParam('1', $password);
                            $insert_stmt->bindParam('2', $random_salt);
                            $insert_stmt->bindParam('3', $_SESSION['user_id']);

                            if(!$insert_stmt->execute())
                            {
                                $results["error"] = "Registration failure: INSERT";
                            } else {
                                $results["result"] = true;
                            }
                        } else {
                            $results["error"] = "Registration failure: INSERT PREPARE";
                        }
                    } else {
                        $results["error"] = "original password does not match";
                    }
                } else {
                    $results["error"] = "database error: no user";
                }
            } else {
                $results["error"] = "database error: no file";
            }
        } else {
            $results["error"] = "no post set";
        }
    } else {
        $results["error"] = "not logged in";
    }
    
    echo json_encode($results);
   
    $db = null;
    $stmt = null;
    exit();
?>

