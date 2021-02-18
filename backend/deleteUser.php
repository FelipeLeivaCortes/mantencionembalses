<?php
    
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$username   = $_POST["username"];
    
        $QUERY  =   $LINK -> prepare("DELETE FROM usuario WHERE rut = ?");
		$QUERY  ->	bind_param('i', $username);
        $QUERY  ->  execute();

        if( $QUERY->affected_rows == 1 ){
            $DATA["ERROR"] 		= false;
	        $DATA["MESSAGE"]	= "Se ha eliminado el rut exitosamente";
    
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
