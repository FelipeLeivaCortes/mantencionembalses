<?php  
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
        $DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$idCompany  = $_POST["idCompany"];
		$LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
		
		$topic		= $_POST["topic"];
		$message	= $_POST["message"];
		
		$QUERY  =   $LINK -> prepare("INSERT INTO `reporte` (`tema`, `mensaje`, `estado`) 
											VALUES (?, ?, false)");
		$QUERY  ->  bind_param('ss',$topic, $message);
		$QUERY  ->  execute();

		if( $QUERY->affected_rows == 1 ){
			$DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "Se ha agregado la consulta exitosamente";
		}else{
			$DATA["ERROR"] 		= true;
			$DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
