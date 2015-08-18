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
        if($stmt = $db->prepare("SELECT race, religion, home FROM info where uid = ?"))
        {
            $stmt->bindParam('1',$_SESSION['user_id']);
            $stmt->execute();
            $row = $stmt->fetchAll();
            if($row != null)
            {
                $results['race']        = $row[0]['race'];
                $results['religion']    = $row[0]['religion'];
                $results['home']        = $row[0]['home'];
                $results['result']      = true;
            } else {
                $results['race']        = "";
                $results['religion']    = "";
                $results['home']        = "";
                $results['result']      = true;
            }
        } else {
            $results["error"] = "database error";
        }
    } else {
        $results["error"] = "not logged in";
    }
    echo json_encode($results);
   
    $db = null;
    $stmt = null;
    exit();
?>