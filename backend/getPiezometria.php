<?php
    session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $season     = $_POST["season"];

        $LINK   ->  close();
        $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

        $QUERY  =   $LINK -> prepare("SELECT COUNT(*) FROM information_schema.columns 
                                        WHERE table_name = 'piezometria';");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($numPits);
        $QUERY  ->  fetch();
        $QUERY  ->  free_result();

        $QUERY  =   $LINK -> prepare("SELECT fecha, cota, pcg1, pcg2, pcg3, pcg4, pcg5, pcg6, pcg7, pcg8,
                                pcg9, pcg10, pcg11, pcg12, pcg13, pcg14 FROM piezometria 
                                WHERE year(fecha) = ? ORDER BY month(fecha) ASC");
        $QUERY  ->  bind_param("s", $season);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($date, $cota, $pcg1, $pcg2, $pcg3, $pcg4, $pcg5, $pcg6, $pcg7, $pcg8, $pcg9,
                                $pcg10, $pcg11, $pcg12, $pcg13, $pcg14);
        
        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
        
        }else{
            $DATA["ERROR"]      = false;
            $DATA["COUNT"]      = $QUERY->num_rows;
            $DATA["numPits"]    = $numPits - 2;

            while ( $QUERY -> fetch() ){
				array_push($DATA, [
				    'date'  => $date,
                    'cota'  => $cota,
                    'pcg1'  => $pcg1,
                    'pcg2'  => $pcg2,
                    'pcg3'  => $pcg3,
                    'pcg4'  => $pcg4,
                    'pcg5'  => $pcg5,
                    'pcg6'  => $pcg6,
                    'pcg7'  => $pcg7,
                    'pcg8'  => $pcg8,
                    'pcg9'  => $pcg9,
                    'pcg10' => $pcg10,
                    'pcg11' => $pcg11,
                    'pcg12' => $pcg12,
                    'pcg13' => $pcg13,
                    'pcg14' => $pcg14,
                ]);
			}
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>