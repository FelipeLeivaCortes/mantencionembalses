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

        $arrayRecords       = array();
        $arrayEvents        = array();
        $arrayOutstanding   = array();

        /**
         * Getting the pending and important records
         */ 
        $QUERY  =   $LINK -> prepare("SELECT id, importancias FROM registro WHERE estado = 0 AND revisada = 0");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($idRecord, $stringImportance);

        if( $QUERY->num_rows > 0 ){

            while ( $QUERY -> fetch() ){
				array_push($arrayRecords, [
				    'id'    => $idRecord,
				]);

                $arrayImportances   = explode(",", $stringImportance);
                $founded            = false;

                for($i=0; $i<sizeof($arrayImportances); $i++){
                    if( $arrayImportances[$i] == "1" ){
                        $founded    = true;
                        break;
                    }
                }

                if( $founded ){
                    array_push($arrayOutstanding, [
                        'id'    => $idRecord,
                    ]);
                }
			}
        }

        /**
         * Getting the event´s document
         */
        $QUERY  ->  free_result();
        $QUERY  =   $LINK -> prepare("SELECT id, nombre FROM documento WHERE tipo = 'Event' AND archivado = 0;");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($idDocument, $nameDocument);

        if( $QUERY->num_rows > 0 ){
            
            while ( $QUERY -> fetch() ){
				array_push($arrayEvents, [
				    'id'    => $idDocument,
                    'name'  => $nameDocument,
                    'link'  => "mantencionembalses/".$PATH_FILES.$ID_COMPANY.$PATH_EVENTS.$nameDocument,
				]);
			}
        }

        $DATA["records"]        = $arrayRecords;
        $DATA["events"]         = $arrayEvents;
        $DATA["outstanding"]    = $arrayOutstanding;

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>