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

        $data		=	array(
            "type"			=>	"UPDATE",
            "query"			=>	"UPDATE actividad SET nombre = ?, fechaInicio = ?, frecuencia = ?, sector = ?, prioridad = ?, 
                                    area = ?, observacion = ? WHERE id = ?;",
            "parameters"	=>	array(
                                    "ssissssi",
                                    $_POST["name"],
                                    $_POST["date"],
                                    $_POST["frecuency"],
                                    $_POST["location"],
                                    $_POST["priority"],
                                    $_POST["area"],
                                    $_POST["comments"],
                                    $_POST["id"]
                                )
        );
        $result1	=	query($LINK, $data, true);

        if($result1 == 1){
            $DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "Se ha modificado la actividad exitosamente";

        }else{
            $DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
        }
    }

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>