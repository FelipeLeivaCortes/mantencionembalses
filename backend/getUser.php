<?php
    session_start();
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
	    $username   = $_POST["username"];
	    
        $QUERY1 =   $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?");
        $QUERY1 ->  bind_param("i", $username);
        $QUERY1 ->  execute();
        $QUERY1 ->  store_result();
        $QUERY1 ->  bind_result($name, $lastname);

        if( $QUERY1->num_rows == 1 ){
            $QUERY1 ->  fetch();
            
            $DATA["name"]       = $name;
            $DATA["lastname"]   = $lastname;

        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 4;
		    $DATA["MESSAGE"]    = "El rut ingresado no está registrado";
        }

        $QUERY1 ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
