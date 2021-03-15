<?php  
    include "configuration.php";

	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
	   $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$LINK 	-> close();		

		$idCompany		= $_POST["idCompany"];
		$arrayDate		= json_decode($_POST["dates"]);
		$arrayCota		= json_decode($_POST["cota"]);
		$arrayPcg1		= json_decode($_POST["pcg1"]);
		$arrayPcg2		= json_decode($_POST["pcg2"]);
		$arrayPcg3		= json_decode($_POST["pcg3"]);
		$arrayPcg4		= json_decode($_POST["pcg4"]);
		$arrayPcg5		= json_decode($_POST["pcg5"]);
		$arrayPcg6		= json_decode($_POST["pcg6"]);
		$arrayPcg7		= json_decode($_POST["pcg7"]);
		$arrayPcg8		= json_decode($_POST["pcg8"]);
		$arrayPcg9		= json_decode($_POST["pcg9"]);
		$arrayPcg10		= json_decode($_POST["pcg10"]);
		$arrayPcg11		= json_decode($_POST["pcg11"]);
		$arrayPcg12		= json_decode($_POST["pcg12"]);
		$arrayPcg13		= json_decode($_POST["pcg13"]);
		$arrayPcg14		= json_decode($_POST["pcg14"]);

		$LINK	= 	new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

		$numErrors		= 0;
		$items			= sizeof($arrayDate);

		for( $i=0; $i<$items; $i++ ){
		//	$dataAux	= strtotime($arrayDate[$i]);
		//	$date		= date('Y-m-d', $dataAux);
			$date		= $arrayDate[$i];
			$cota		= floatval( $arrayCota[$i] );
			$pcg1		= floatval( $arrayPcg1[$i] );
			$pcg2		= floatval( $arrayPcg2[$i] );
			$pcg3		= floatval( $arrayPcg3[$i] );
			$pcg4		= floatval( $arrayPcg4[$i] );
			$pcg5		= floatval( $arrayPcg5[$i] );
			$pcg6		= floatval( $arrayPcg6[$i] );
			$pcg7		= floatval( $arrayPcg7[$i] );
			$pcg8		= floatval( $arrayPcg8[$i] );
			$pcg9		= floatval( $arrayPcg9[$i] );
			$pcg10		= floatval( $arrayPcg10[$i] );
			$pcg11		= floatval( $arrayPcg11[$i] );
			$pcg12		= floatval( $arrayPcg12[$i] );
			$pcg13		= floatval( $arrayPcg13[$i] );
			$pcg14		= floatval( $arrayPcg14[$i] );

			$QUERY 	= $LINK -> prepare("INSERT INTO piezometria(fecha, cota, pcg1, pcg2, pcg3, pcg4, pcg5, pcg6,
										pcg7, pcg8, pcg9, pcg10, pcg11, pcg12, pcg13, pcg14) VALUES (?, ?, ?, ?, 
										?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			$QUERY 	-> bind_param("sddddddddddddddd", $date, $cota, $pcg1, $pcg2, $pcg3, $pcg4, $pcg5, $pcg6, $pcg7,
									$pcg8, $pcg9, $pcg10, $pcg11, $pcg12, $pcg13, $pcg14);
			$QUERY	-> execute();

			if( $QUERY->affected_rows != 1 ){
				$numErrors++;

				array_push($DATA, [
					'argument'	=>	"Error insertation",
					'row'		=> 	$i + 2,
				]);
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
