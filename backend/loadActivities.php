<?php  
    include "configuration.php";

	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
	   $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$LINK 	-> close();		

		$idCompany 			= $_POST["idCompany"];
		$arrayNames			= json_decode($_POST["names"]);
		$arrayDates 		= json_decode($_POST["dates"]);
		$arrayFrecuencies	= json_decode($_POST["frecuencies"]);
		$arrayLocations 	= json_decode($_POST["locations"]);
		$arrayPriorities 	= json_decode($_POST["priorities"]);
		$arrayAreas			= json_decode($_POST["areas"]);
		$arrayComments		= json_decode($_POST["comments"]);
		
		$LINK = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

		$numErrors			= 0;
		$items				= sizeof($arrayNames);

		for($i=0; $i<$items; $i++){
			$name 		= $arrayNames[$i];
			$dataAux	= strtotime($arrayDates[$i]);
			$dateStart	= date('Y-m-d', $dataAux);
			$frecuency 	= intval($arrayFrecuencies[$i]);
			$location 	= $arrayLocations[$i];
			$priority 	= $arrayPriorities[$i];
			$area 		= $arrayAreas[$i];
			$comment	= $arrayComments[$i];

			$QUERY 	= $LINK -> prepare("SELECT COUNT(*) FROM actividad WHERE nombre = ? AND sector = ?");
			$QUERY 	-> 	bind_param("ss", $name, $location);
			$QUERY 	-> 	execute();
			$QUERY 	->	store_result();
			$QUERY	->	bind_result($countElements);
			$QUERY 	-> 	fetch();

			if($countElements > 0){
				$numErrors++;

				array_push($DATA, [
				   'name'	=>   $name,
				   'argument'	=>   "Activity repeated",
				   'position'	=>   $i + 2,
				]);

			}else{
				$QUERY 	= $LINK -> prepare("INSERT INTO actividad(nombre, fechaInicio, frecuencia, sector, prioridad, area, ultimaMantencion, proximaMantencion, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
				$QUERY 	-> bind_param("ssissssss", $name, $dateStart, $frecuency, $location, $priority, $area, $defaultDate, $dateStart, $comment);
				$QUERY	-> execute();

				if( $QUERY->affected_rows != 1 ){
					$numErrors++;
	
					array_push($DATA, [
						'name'		=>	$name,
						'argument'	=>	"Error insertation",
						'position'	=> 	$i + 2,
					]);
				}
			}
		}

		if($numErrors == 0){
		   $DATA["ERROR"]	= false;
		   $DATA["MESSAGE"]	= 'Se han agregado '.$items.' actividades exitosamente';
		
		}else{
		   $DATA["ERROR"]	= true;
		   $DATA["ERRNO"]	= 48;
		   $DATA["MESSAGE"]	= 'Se han omitido '.$numErrors.' actividades, por errores de estructura. Comuníquese con el administrador';
		}

        	$QUERY  -> free_result();
		$LINK   -> close();
	}

    	header('Content-Type: application/json');
	echo json_encode($DATA);
?>
