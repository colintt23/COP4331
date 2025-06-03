<?php
    $inData = getRequestInfo();

    $firstName = $inData["FirstName"]; 
    $lastName = $inData["LastName"];
    $phone = $inData["Phone"]; 
    $email = $inData["Email"];
    $userId = $inData["userId"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if($conn->connect_error)
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
//Delete by first and last,or phone, or email, AND userID for all
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ((FirstName = ? AND LastName = ?) OR Phone = ? OR Email = ?) AND UserID = ?");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
        $stmt->execute();
            $stmt->close();
            $conn->close();
            returnWithError("");
    }



    function getRequestInfo()
        {
                return json_decode(file_get_contents('php://input'), true);
        }

    function sendResultInfoAsJson( $obj )
        {
                header('Content-type: application/json');
                echo $obj;
        }
 function returnWithError( $err )
        {
                $retValue = '{"error":"' . $err . '"}';
                sendResultInfoAsJson( $retValue );
        }

?>
