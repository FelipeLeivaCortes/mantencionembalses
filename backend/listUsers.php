<?php
    
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{

		$idCompany 	= $_POST["idCompany"];
		$LINK 		= new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

		// PREPARE THE QUERY FOR SEARCH THE LIST OF SYSTEM´S USERS 
		$QUERY 	    =   $LINK -> prepare("SELECT rut, permisos, nombre, apellido, correo, telefono FROM usuario WHERE idEmpresa = ? ORDER BY nombre ASC");
		$QUERY 		->	bind_param("i", $idCompany);
		$QUERY      ->  execute();
        $QUERY      ->  store_result();
        $QUERY      ->  bind_result($rut, $permisos, $nombre, $apellido, $correo, $telefono);        
        
        if( $QUERY->affected_rows > 0 ){
            $DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "";
			
			$DATA["count"] 	    = $QUERY->num_rows;
	
			while ( $QUERY -> fetch() ){
				array_push($DATA, [
					'username'      => $rut,
					'permissions' 	=> $permisos,
					'name'	        => $nombre,
					'lastname'	    => $apellido,
					'email'	        => $correo,
					'phone'	        => $telefono,
		    	]);
			}
			
        }else{
			$DATA["ERROR"]      = true;
			$DATA["ERRNO"]      = 5;
			$DATA["MESSAGE"]    = "No se han encontrado usuarios en la base de datos";
			
        }

        $QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
