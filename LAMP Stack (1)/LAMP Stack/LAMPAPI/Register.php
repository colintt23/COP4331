<?php

  $inData = getRequestInfo();
  //similar to AddContacts.php
	$firstName = $inData["FirstName"];
  $lastName = $inData["LastName"];
  $userName = $inData["Login"];
  $password = $inData["Password"];


$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
    // checking if a user already exists with entered data, 
    //similar to the SearchContacts part
    $query = " SELECT * FROM Users WHERE Login = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s",$userName);
    $stmt->execute();
    $result = $stmt->get_result();
    //mysqli_num_rows checks the rows if > 0 then it exists
    $rows = mysqli_num_rows($result);
    

    // does not currently exist, can add it to the table
    if($rows == 0)
    {
    $hashPW = password_hash($password, PASSWORD_DEFAULT); // has password for security
      // Similar to AddContacts file
      $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
      $stmt->bind_param("ssss",$firstName, $lastName, $userName, $hashPW);
		  $stmt->execute();
      // insert ID for the new user from auto increment of database table,
      $id = $conn->insert_id;
		  $stmt->close();
		  $conn->close();
      returnWithInfo('{"id": "' . $id . '"}');
	  }
    else
      //row > 0, username already in database
    {
            $stmt->close();
            $conn->close();
      			returnWithError("Username already taken!");

    }
  }

//same functions
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
function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
