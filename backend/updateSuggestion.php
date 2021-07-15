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
        $approval   = intval($_POST["approval"]);

        $type       = $approval ? "UPDATE" : "DELETE"; 
        $query      = $approval ? "UPDATE sugerencia SET estado = 1, revisada = 1 WHERE idRecord = ?" : "DELETE FROM sugerencia WHERE idRecord = ?";

        $data		=	array(
            "type"			=>	$type,
            "query"			=>	$query,
            "parameters"	=>	array(
                                    "i",
                                    $_POST["idRecord"]
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
            $DATA["MESSAGE"]    = $approval == 1 ? "Se ha aceptado la sugerencia exitosamente" : "Se ha rechazado la sugerencia exitosamente";

        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>