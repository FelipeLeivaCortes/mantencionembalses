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
		$LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	/***************************************************************************** */
	/***************************************************************************** */

		unset($_SESSION['idCompany']);
		unset($_SESSION['userDatabase']);
		unset($_SESSION['passDatabase']);
	    unset($_SESSION['username']);
		unset($_SESSION['name']);
		unset($_SESSION['lastname']);
		unset($_SESSION['timesession']);

		if( session_destroy() ){
			$DATA["ERROR"]      = false;
			$DATA["MESSAGE"]    = "Se ha cerrado la sesión exitosamente";

		}else{
			$DATA["ERROR"]      = true;
			$DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
