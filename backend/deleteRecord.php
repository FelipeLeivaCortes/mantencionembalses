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

        $id         =   $_POST["id"];
        
	    $QUERY  =   $LINK -> prepare("DELETE FROM registro WHERE id = ?");
	    $QUERY  ->  bind_param('i', $id);
        $QUERY  ->  execute();

        if( $QUERY->affected_rows == 1 ){
            $DATA["ERROR"] 		= false;
	        $DATA["MESSAGE"]	= "Se ha eliminado el registro exitosamente";
    
        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 3;
            $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
        }

        $QUERY      -> free_result();
        $LINK       -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
