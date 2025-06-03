<?php

$inData = getRequestInfo();

$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$userName = $inData["login"];
$password = $inData["password"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error) 
{
    returnWithError( $conn->connect_error );
} 
else
{
    // checking if a user already exists with entered data
    $query = "SELECT * FROM Users WHERE Login = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $userName);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = mysqli_num_rows($result);
    
    // does not currently exist, can add it to the table
    if($rows == 0)
    {
        // Similar to AddContacts file
        $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $firstName, $lastName, $userName, $password);
        $stmt->execute();
        
        if($stmt->affected_rows > 0) {
            $stmt->close();
            $conn->close();
            returnWithError(""); // Empty error means success
        } else {
            $stmt->close();
            $conn->close();
            returnWithError("Failed to create user");
        }
    }
    else
    {
        // row > 0, username already in database
        $stmt->close();
        $conn->close();
        returnWithError("Username already taken!");
    }
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