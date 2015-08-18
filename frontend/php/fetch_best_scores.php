<?php 

    $results = array(
        "result" => false,
        "players" => array(),
        "error" => ""
        );

    $db = new PDO('sqlite:../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    if($stmt = $db->prepare("SELECT * FROM users"))
    {
        $stmt->execute();
        $row = $stmt->fetchAll();
        
        foreach( $row as $player){
            $results["players"][$player["username"]] = $player["highscore"];
        }

        $results["result"] = true;
    } else {
        $results["error"] = "database error";
    }

    echo json_encode($results);
   
    $db = null;
    $stmt = null;
    exit();
?>