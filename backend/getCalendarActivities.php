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

        $QUERY  =   $LINK -> prepare("SELECT id, nombre, proximaMantencion FROM actividad WHERE prioridad = ? AND area = ? AND year(proximaMantencion) = ? ORDER BY proximaMantencion DESC");
        $QUERY  ->  bind_param("ssi", $priority, $area, $year);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($id, $name, $nextMaintance);

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
		    $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

        }else{
            $DATA["ERROR"]  = false;
			$DATA["COUNT"]  = $QUERY->num_rows;
    
            while ( $QUERY->fetch() ){
                array_push($DATA, [
                    'id'            => $id,
                    'name'          => $name,
                    'nextMaintance' => $nextMaintance,
                ]);
			}
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>