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
        $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

    /***************************************************************************** */
    /***************************************************************************** */
    
        $data		=	array(
			"type"			=>	"DELETE",
			"query"			=>	"DELETE FROM usuario WHERE rut = ?",
			"parameters"	=>	array(
									"i",
									$_POST["username"]
								)
		);
		$result1	=	query($LINK, $data, true);	
	
		if($result1 == 0){
			$DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		
		}else if($result1 > 1){
			$DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 5;
			$DATA["MESSAGE"]	= "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";
		
		}else{
			$DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "Se ha eliminado el rut exitosamente";
		}
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
