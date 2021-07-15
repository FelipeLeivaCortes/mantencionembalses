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
		$idRecord		= $_POST["idRecord"];
		$idActivities	= $_POST["idActivities"];
		$dateSuggest	= $_POST["dateSuggest"];

		$QUERY	=   $LINK -> prepare("SELECT id FROM sugerencia WHERE idRecord = ?;");
		$QUERY	->  bind_param('i', $idRecord);
		$QUERY	->  execute();
		$QUERY	->  store_result();
		$QUERY	->  bind_result($idSuggest);
		$QUERY	->  fetch();
	
		if( $QUERY->num_rows >= 1 ){
			$DATA["ERROR"]      = true;
			$DATA["ERRNO"]      = "M";
			$DATA["MESSAGE"]    = "El registro " . $idRecord . " ya tiene asociada una sugerencia.";
		
		}else{
			$QUERY  ->  free_result();
			$QUERY  =   $LINK -> prepare("INSERT INTO sugerencia (idRecord, idActivities, fecha) VALUES (?, ?, ?);");
			$QUERY  ->  bind_param('iss', $idRecord, $idActivities, $dateSuggest);
			$QUERY  ->  execute();

			if( $QUERY->affected_rows == 1 ){
				$DATA["ERROR"] 		= false;
    			$DATA["MESSAGE"]	= "Se ha agregado la sugerencia exitosamente";

			}else{
				$DATA["ERROR"] 		= true;
				$DATA["ERRNO"]		= 3;
				$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
            
			}
	    
		}

		$QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
