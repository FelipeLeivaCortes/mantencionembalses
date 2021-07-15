<?php
    session_start();
    include "configuration.php";

	if( empty($LINK) ){
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

        $idRecord   =   $_POST["idRecord"];
        
        $QUERY  =   $LINK -> prepare("SELECT estados FROM registro WHERE id = ?;");
        $QUERY  ->  bind_param("i", $idRecord);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($states);
        $QUERY  ->  fetch();

        $array_states   = explode(",", $states);
        $found          = false;

        for($i=0; $i<sizeof($array_states); $i++){
            if( $array_states[$i] == "1" ){
                $found  = true;
                break;
            }
        }

        if($found){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 87;
            $DATA["MESSAGE"]    = "No se puede eliminar la guía porque ya actividades con mantenciones realizadas";

        }else{
            $QUERY  ->  free_result();
            $QUERY  =   $LINK -> prepare("DELETE FROM registro WHERE id = ?");
            $QUERY  ->  bind_param('i', $idRecord);
            $QUERY  ->  execute();

            if( $QUERY->affected_rows == 1 ){

                $QUERY  ->  free_result();
                $QUERY  =   $LINK -> prepare("DELETE FROM sugerencia WHERE idRecord = ?");
                $QUERY  ->  bind_param('i', $idRecord);
                $QUERY  ->  execute();

                $DATA["ERROR"] 		= false;
                $DATA["MESSAGE"]	= "Se ha eliminado el registro exitosamente";
        
            }else{
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 3;
                $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
            }
        }

        $QUERY      -> free_result();
        $LINK       -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
