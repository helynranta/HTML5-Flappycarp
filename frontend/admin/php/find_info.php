<?php 
    
    $results = array(
        "result" => false
        );

    include_once 'authenticate.php';
    include_once '../../php/include/functions.php';

    sec_session_start();
    
    $db = new PDO('sqlite:../../db/users.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if(admin_login_check($db))
    {
        if(isset($_POST['uid']))
        {
            $results['uid'] = $_POST['uid'];
            if($stmt = $db->prepare("SELECT info.race, info.religion, info.home, 
                stats.count, stats.distance, users.highscore, users.ban FROM users 
                LEFT JOIN info ON users.uid = info.uid 
                LEFT JOIN stats ON users.uid = stats.uid 
                where users.uid = ?"))
            {
                $stmt->bindParam('1',$_POST['uid']);
                $stmt->execute();
                $row = $stmt->fetchAll();
                if($row != null)
                {
                    $results['race']        = $row[0]['race'];
                    $results['religion']    = $row[0]['religion'];
                    $results['home']        = $row[0]['home'];
                    $results['count']        = $row[0]['count'];
                    $results['distance']        = $row[0]['distance'];
                    $results['highscore']        = $row[0]['highscore'];
                    $results['ban']        = $row[0]['ban'];
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
            $results["error"] = "post not set";
        }
    } else {
        $results["error"] = "not logged in";
    }
    echo json_encode($results);
   
    $db = null;
    $stmt = null;
    exit();
?>