<?php
    
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
	    session_start();
	    
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
