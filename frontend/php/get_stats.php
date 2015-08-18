<?php 
    
    include_once 'include/functions.php';
    sec_session_start();

    $results = array(
        "result" => false
        );

    $db = new PDO('sqlite:../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if(isset($_SESSION['user_id']))
    {   

        if($stmt = $db->prepare("SELECT count, distance FROM stats WHERE uid = ?"))
        {
            $stmt->bindParam('1',$_SESSION['user_id']);
            $stmt->execute();
            $row = $stmt->fetchAll();
            
            if($row != null)
            {
                $count = $row[0]["count"];
                $distance = $row[0]["distance"];   
                $results["result"] = true;
                $results["distance"] = $distance;
                $results["count"] = $count;
                 
            }else{ 
                $results["result"] = true;
                $results["distance"] = 0;
                $results["count"] = 0;
            }
        } else {
            $results["error"] = "database error";
        }
    } else {
        echo $_POST["distance"];
        $results["error"] = "post not set";
    }
    echo json_encode($results);
    $db = null;
    $stmt = null;

    exit();
?>