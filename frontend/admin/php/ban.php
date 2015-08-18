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
    if(isset($_POST['uid'], $_POST['ban']))
    {
        $results['uid'] = $_POST['uid'];
        $results['ban'] = $_POST['ban'];
        if($stmt = $db->prepare("SELECT ban from users where uid = ?"))
        {
            $stmt->bindParam('1',$_POST['uid']);
            
            $stmt->execute();
            $row = $stmt->fetch();
            if($row)
            {
            	$ban = 0;
                if ( intval($row['ban']) == 0 )
                	$ban = 1;
                if($insert_stmt = $db->prepare('UPDATE users SET ban = ? where uid = ?'))
                {
            		$insert_stmt->bindParam('1', $ban);
            		$insert_stmt->bindParam('2', $_POST['uid']);
            		if(!$insert_stmt->execute())
            		{
            			$results['error'] = "database error: EXECUTE INSERT";
            		} else {
            			$results['result'] = true;
            			$results['ban'] = $ban;
            		}
            	} else {
                	$results['error'] = "database error: PREPARE INSERT";
            	}
            } else {
                $results['error'] = "database error: SELECT";
            }
        } else {
            $results["error"] = "database error: PREPARE SELECT";
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
$insert_stmt = null;
exit();
?>