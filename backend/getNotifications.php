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

        $arrayOutstanding   = array();

        /**
         * Getting the pending and important records
         */ 
        $data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT id, importancias FROM registro WHERE estado = ? AND revisada = ?",
			"parameters"	=>	array(
									"ii",
									0,
									0
								)
		);
		$result1	=	query($LINK, $data, false);

        for($i=0; $i<sizeof($result1); $i++){
            
            $arrayImportances   = explode(",", $result1[$i]["importancias"]);
            $founded            = false;

            for($j=0; $j<sizeof($arrayImportances); $j++){
                if( $arrayImportances[$j] == "1" ){
                    $founded    = true;
                    break;
                }
            }

            if($founded){
                array_push($arrayOutstanding, [
                    'id'    => $result1[$i]["id"],
                ]);
            }
        }




        /**
         * Getting the event´s document
         */
        $data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT id, nombre FROM documento WHERE tipo = 'Event' AND archivado = ?;",
			"parameters"	=>	array(
									"i",
									0
								)
		);
		$result2	=	query($LINK, $data, false);

        if(sizeof($result2)>0){
            for($i=0; $i<sizeof($result2); $i++){
                $result2[$i]["link"] = "mantencionembalses/".$PATH_FILES.$ID_COMPANY.$PATH_EVENTS.$result2[$i]["nombre"];
            }
        }

        /**
         * Getting the suggest
         */
        $data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT id, idRecord, fecha FROM sugerencia WHERE revisada = ?;",
			"parameters"	=>	array(
									"i",
									0
								)
		);
		$result3	=	query($LINK, $data, true);

        $DATA["records"]        = $result1;
        $DATA["events"]         = $result2;
        $DATA["outstanding"]    = $arrayOutstanding;
        $DATA["suggests"]       = $result3;
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>