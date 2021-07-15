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
            "query"			=>	"SELECT id, fechaInicio, estado FROM registro ORDER BY id DESC LIMIT 20;",
            "parameters"	=>	""
        );
        $result1	=	query($LINK, $data, true);

        if(sizeof($result1) == 0){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 73;
            $DATA["MESSAGE"]    = "No se han encontrado registros de mantenciones pendientes en el sistema";
        
        }else{
            $DATA["count"]  = sizeof($result1);

            for($i=0; $i<sizeof($result1); $i++){
                $today      = new DateTime("now");
                $dateAux    = new DateTime($result1[$i]["fechaInicio"]);
                $daysLate   = date_diff($dateAux, $today)->format('%a');

                array_push($DATA, [
                    'id'        => $result1[$i]["id"],
                    'state'     => $result1[$i]["estado"],
                    'dateStart' => $result1[$i]["fechaInicio"],
                    'daysLate'  => $daysLate,
                ]);
            }
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>