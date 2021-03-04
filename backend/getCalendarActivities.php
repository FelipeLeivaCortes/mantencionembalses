<?php
    session_start();
    include "configuration.php";
    
	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $year       = $_POST["year"];
        $area       = $_POST["area"];
        $priority   = $_POST["priority"];

        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
        $found      = false;

        for($i=0; $i<12; $i++){
            $arrayIds   = array();
            $arrayNames = array();
            $arrayDates = array();

            $QUERY  =   $LINK -> prepare("SELECT id, nombre, proximaMantencion, sector FROM actividad WHERE prioridad = ? AND area = ? AND YEAR(proximaMantencion) = ? AND MONTH(proximaMantencion) = ? ORDER BY nombre DESC");
            $QUERY  ->  bind_param("ssii", $priority, $area, $year, $i);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name, $nextMaintance, $location);

            $index  = 0;

            if( $QUERY->num_rows>0 ){
                $found  = true;
            }

            while( $QUERY->fetch() ){
                $arrayIds[$index]   = $id;
                $arrayNames[$index] = $location.": ".$name;
                $arrayDates[$index] = $nextMaintance;

                $index++;
            }

            array_push($DATA, [
                'elements'          => $index,
                'ids'               => $arrayIds,
                'names'             => $arrayNames,
                'nextMaintances'    => $arrayDates,    
            ]);

            $QUERY  -> free_result();
        }

        if( !$found ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
        
        }else{
            $DATA["ERROR"]  = false;
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>