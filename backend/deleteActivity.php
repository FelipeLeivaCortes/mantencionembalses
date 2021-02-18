<?php
    session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

        $id         =   $_POST["id"];
        
		$QUERY      =   $LINK -> prepare("DELETE FROM actividad WHERE id = ?");
		$QUERY      ->	bind_param('i', $id);
        $QUERY      ->  execute();
        
        if( $QUERY->affected_rows == 1 ){
            $DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "Se ha eliminado la actividad exitosamente";
        
        }else{
            $DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>