<?php
    include "configuration.php";

	if(empty($LINK) ){
	   $DATA["ERROR"]      = true;
           $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
           $idCompany  =   $_POST["idCompany"];
           $id         =   $_POST["id"];
        
	   $LINK   ->  close();
	   $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
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
