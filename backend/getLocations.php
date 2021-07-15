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
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

    /***************************************************************************** */
    /***************************************************************************** */

        $data		=	array(
            "type"			=>	"SELECT",
            "query"			=>	"SELECT nombre FROM sector ORDER BY nombre ASC;",
            "parameters"	=>	""
        );
        $result1	=	query($LINK, $data, true);

        if(sizeof($result1) == 0){
            $DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]	= "No se han encontrado resultados en su búsqueda";
        
        }else{
            $DATA["ERROR"]      = false;
            $DATA["count"]      = sizeof($result1);

            for($i=0; $i<sizeof($result1); $i++){
                array_push($DATA, [
				    'location'  => $result1[$i]["nombre"]
				]);
            }	
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>