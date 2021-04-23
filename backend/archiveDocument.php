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

        $id         = $_POST["id"];
        $type       = $_POST["type"];
        $action     = $_POST["action"];

        $QUERY      = "";

        if( $action == 0 ){
            $QUERY  =   $LINK->prepare("UPDATE documento SET archivado = 0 WHERE id = ?;");
            $QUERY  ->  bind_param("i", $id);
            $QUERY  ->  execute();

        }else if( $action == 1 ){
            $QUERY  =   $LINK->prepare("UPDATE documento SET archivado = 1 WHERE id = ?;");
            $QUERY  ->  bind_param("i", $id);
            $QUERY  ->  execute();

        }
        
        if( $QUERY->affected_rows == 1 ){
            $DATA["ERROR"]      = false;
            $DATA["MESSAGE"]    = "Se ha archivado el documento exitosamente";
      
        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 92;
            $DATA["MESSAGE"]    = "No se ha podido archivar el documento. Comuníquese con el administrador";
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>