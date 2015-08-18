<?php 
    
    include_once 'include/functions.php';
    sec_session_start();

    $results = array(
        "result" => false
        );

    $db = new PDO('sqlite:../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if(isset($_POST['score'], $_SESSION['username']))
    {   

        if($stmt = $db->prepare("SELECT highscore FROM users WHERE username = ?"))
        {
            $stmt->bindParam('1',$_SESSION['username']);
            $stmt->execute();
            $row = $stmt->fetchAll();
            
            if($row)
            {
                if(floatval($_POST['score']) > floatval($row[0]))
                {
                    
                    $insert_stmt = $db->prepare("UPDATE users SET highscore = ? WHERE uid = ?");
                    $insert_stmt->bindParam('1', $_POST['score'] );
                    $insert_stmt->bindParam('2', $_SESSION['user_id'] );
                    $insert_stmt->execute();

                    $results["result"] = true;
                } else {
                    $results["error"] = "bigger score exits";
                    $results["score"] = $row[0];
                }
            } else {
                $results["error"] = "database error: no user?";
            }
        } else {
            $results["error"] = "database error";
        }
    } else {
        $results["error"] = "post not set";
    }

    echo json_encode($results);
    $db = null;
    $stmt = null;

    exit();
?>