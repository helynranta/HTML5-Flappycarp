<?php 
    
    include_once 'include/functions.php';
    sec_session_start();

    $results = array(
        "result" => false
        );

    $db = new PDO('sqlite:../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if(isset($_POST['distance'], $_SESSION['user_id']))
    {   

        if($stmt = $db->prepare("SELECT count, distance FROM stats WHERE uid = ?"))
        {
            $stmt->bindParam('1',$_SESSION['user_id']);
            $stmt->execute();
            $row = $stmt->fetchAll();
            
            if($row != null)
            {
                $count = $row[0]["count"] + 1;
                $distance = $row[0]["distance"] + $_POST['distance'];   
                $insert_stmt = $db->prepare("UPDATE stats SET count = ?, distance = ? WHERE uid = ?");
                $insert_stmt->bindParam('3', $_SESSION['user_id'] );
                $insert_stmt->bindParam('1', $count );
                $insert_stmt->bindParam('2', $distance );
                $insert_stmt->execute();

                $results["result"] = true;
                $results["distance"] = $distance;
                $results["count"] = $count;
                 
            }else{
                $insert_stmt = $db->prepare("INSERT INTO stats (uid, count, distance) values (?,1,?)");
                $insert_stmt->bindParam('1', $_SESSION['user_id'] );
                $insert_stmt->bindParam('2', $_POST["distance"] );
                $insert_stmt->execute();
                $results["result"] = true;
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