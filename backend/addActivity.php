<?php
	session_start();
    include "configuration.php";

	if( empty($LINK) ){
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
		$LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	/***************************************************************************** */
	/***************************************************************************** */

		$name       	= $_POST["name"];
		$dateStart  	= $_POST["date"];
        $frecuency  	= $_POST["frecuency"];
		$location   	= $_POST["location"];
		$priority   	= $_POST["priority"];
		$area			= $_POST["area"];
		$comments   	= $_POST["comments"];

		$QUERY	=   $LINK -> prepare("SELECT id FROM actividad WHERE nombre = ? AND sector = ?;");
		$QUERY	->  bind_param('ss', $name, $location);
		$QUERY	->  execute();
		$QUERY	->  store_result();
		$QUERY	->  bind_result($idActivity);
		$QUERY	->  fetch();
	
		if( $QUERY->num_rows >= 1 ){
			$DATA["ERROR"]      = true;
			$DATA["ERRNO"]      = 7;
			$DATA["MESSAGE"]    = "La actividad ingresada ya está registrada en la base de datos";
		
		}else{
			$QUERY  ->  free_result();
			$QUERY  =   $LINK -> prepare("INSERT INTO actividad (nombre, fechaInicio, frecuencia, sector, prioridad, area, ultimaMantencion, proximaMantencion, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);");
			$QUERY  ->  bind_param('ssissssss', $name, $dateStart, $frecuency, $location, $priority, $area, $defaultDate, $dateStart, $comments);
			$QUERY  ->  execute();

			if( $QUERY->affected_rows == 1 ){
				$DATA["ERROR"] 		= false;
    			$DATA["MESSAGE"]	= "Se ha agregado la actividad '".$name."' exitosamente";

			}else{
				$DATA["ERROR"] 		= true;
				$DATA["ERRNO"]          = 3;
				$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
            
			}
	    
		}

		$QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
