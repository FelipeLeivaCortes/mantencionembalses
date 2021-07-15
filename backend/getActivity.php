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
            "type"			=>	"SELECT",
            "query"			=>	"SELECT nombre, fechaInicio, frecuencia, sector, prioridad, area, observacion FROM actividad WHERE id = ?;",
            "parameters"	=>	array(
                                    "i",
                                    $_POST["id"]
                                )
        );
        $result1	=	query($LINK, $data, true);

        if(sizeof($result1) == 0){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
		    $DATA["MESSAGE"]    = "No se han encontrado resultados";

        }else if(sizeof($result1) > 1){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 5;
		    $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";
        
        }else{
            $DATA["name"]       = $result1[0]["nombre"];
            $DATA["dateStart"]  = $result1[0]["fechaInicio"];
            $DATA["frecuency"]  = $result1[0]["frecuencia"];
            $DATA["location"]   = $result1[0]["sector"];
            $DATA["priority"]   = $result1[0]["prioridad"];
            $DATA["area"]       = $result1[0]["area"];
            $DATA["comments"]   = $result1[0]["observacion"];
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>