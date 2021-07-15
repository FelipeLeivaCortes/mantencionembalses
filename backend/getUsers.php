<?php
	session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{

	/***************************************************************************** */
	/****** ---> DO NOT EDIT THIS UNLESS IT EXTREMELY NECESSARY <--- ************* */
	/***************************************************************************** */

		$USERNAME   = $_SESSION["userDatabase"];
		$PASSWORD   = $_SESSION["passDatabase"];
		$ID_COMPANY = $_SESSION["idCompany"];
		$DATABASE   = "empresa".$ID_COMPANY;
		
		$LINK       ->  close();
		$LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

	/***************************************************************************** */
	/***************************************************************************** */

		$data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT rut, permisos, nombre, apellido, correo, telefono FROM usuario WHERE idEmpresa = ? ORDER BY nombre ASC",
			"parameters"	=>	array(
									"i",
									$ID_COMPANY
								)
		);
		$result1	=	query($LINK, $data, true);	
	
		if(sizeof($result1) == 0){
			$DATA["ERROR"]		= true;
			$DATA["ERRNO"]		= 5;
			$DATA["MESSAGE"]	= "No se han encontrado usuarios en la base de datos";
		
		}else{
            $DATA["ERROR"] 		= false;
			$DATA["count"] 	    = sizeof($result1);
	
			for($i=0; $i<sizeof($result1); $i++){
				array_push($DATA, [
					'username'      => $result1[$i]["rut"],
					'permissions' 	=> $result1[$i]["permisos"],
					'name'	        => $result1[$i]["nombre"],
					'lastname'	    => $result1[$i]["apellido"],
					'email'	        => $result1[$i]["correo"],
					'phone'	        => $result1[$i]["telefono"],
		    	]);
			}	
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
