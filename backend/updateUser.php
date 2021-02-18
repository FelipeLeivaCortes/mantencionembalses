<?php
    
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $id         = $_POST["id"];
		$username   = $_POST["username"];
		$permissions= $_POST["permissions"];
		$name       = $_POST["name"];
		$lastname   = $_POST["lastname"];
		$email      = $_POST["email"];
		$phone      = $_POST["phone"];
		
		if( $phone != "" ){
            $phone  = intval($phone);
		}
		
		/*
		PREPARE THE QUERY FOR UPDATE THE USER´S DATA IN THE DATABASE
		*/

		$QUERY  =   $LINK -> prepare("UPDATE usuario SET rut = ?, permisos = ?, nombre = ?, apellido = ?, correo = ?, telefono = ? WHERE id = ?");
		$QUERY  ->	bind_param('issssii', $username, $permissions, $name, $lastname, $email, $phone, $id);
        $QUERY  ->  execute();
        
        if( $QUERY->affected_rows == 1 ){
            $DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "Se han modificado los datos exitosamente";
        
        }else{
            $DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY  -> free_result();
		$LINK   -> close();
    }
    header('Content-Type: application/json');
	echo json_encode($DATA);
?>