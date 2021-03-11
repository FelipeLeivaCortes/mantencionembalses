<?php  
    include "configuration.php";

	if( empty($LINK) ){
    	$DATA["ERROR"]      = true;
    	$DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$idCompany 	= $_POST["idCompany"];
		$username 	= $_POST["username"];
        $activities	= $_POST["activities"];
		$dateStart	= date('Y-m-d');

		$LINK   ->  close();
		$LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);	

		$arrayAux 	= explode(",", $activities);
		$stringAux	= "0";

		for( $i=1; $i<sizeof($arrayAux); $i++ ){
			$stringAux 	= $stringAux.',0';
		}

		$QUERY  =   $LINK -> prepare("INSERT INTO registro (encargado, actividades, fechaInicio, fechaTermino, estados) VALUES (?, ?, ?, ?, ?);");
		$QUERY  ->  bind_param('issss', $username, $activities, $dateStart, $defaultDate, $stringAux);
		$QUERY  ->  execute();

		if( $QUERY->affected_rows == 1 ){

			$QUERY1	=   $LINK->prepare("SELECT LAST_INSERT_ID();");
        	$QUERY1	->  execute();
        	$QUERY1	->  store_result();
        	$QUERY1	->  bind_result($idRecord);
			$QUERY1	->  fetch();

			if( $QUERY1->num_rows == 1 ){
				$DATA["ERROR"] 		= false;
				$DATA["MESSAGE"]	= "Se han registrado las actividades exitosamente";
				$DATA["idRecord"]	= $idRecord;

				$QUERY1	-> free_result();

			}else{
				$DATA["ERROR"]      = true;
				$DATA["ERRNO"]      = 3;
				$DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
			}

		}else{
			$DATA["ERROR"]	    = true;
			$DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
