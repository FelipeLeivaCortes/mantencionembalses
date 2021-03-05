<?php
    session_start();
    include "configuration.php";
    
	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany          = $_POST["idCompany"];
        $LINK               = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

        $filterLocation     = $_POST["filterLocation"];
        $filterArea         = $_POST["filterArea"];
        $filterPriority     = $_POST["filterPriority"];
        
        // If you don´t have any filter
        if( $filterLocation == "" && $filterArea == "" && $filterPriority == "" ){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre, area FROM actividad");
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name, $area);

        // If only have the location´s filter
        }else if($filterLocation != "" && $filterArea == "" && $filterPriority == ""){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre, area FROM actividad WHERE sector = ?");
            $QUERY  ->  bind_param("s", $filterLocation);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name, $area);

        // If only have the area´s filter
        }else if($filterLocation == "" && $filterArea != "" && $filterPriority == ""){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre FROM actividad WHERE area = ?");
            $QUERY  ->  bind_param("s", $filterArea);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name);

        // If only have the priority´s filter
        }else if($filterLocation == "" && $filterArea == "" && $filterPriority != ""){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre, area FROM actividad WHERE prioridad = ?");
            $QUERY  ->  bind_param("s", $filterPriority);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name, $area);

        // If only have the location and area filter
        }else if($filterLocation != "" && $filterArea != "" && $filterPriority == ""){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre FROM actividad WHERE sector = ? AND area = ?");
            $QUERY  ->  bind_param("ss", $filterLocation, $filterArea);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name);

        // If only have the location and priority filter
        }else if($filterLocation != "" && $filterArea == "" && $filterPriority != ""){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre, area FROM actividad WHERE sector = ? AND prioridad = ?");
            $QUERY  ->  bind_param("ss", $filterLocation, $filterPriority);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name, $area);

        // If only have the area and priority filter
        }else if($filterLocation == "" && $filterArea != "" && $filterPriority != ""){
            $QUERY  =   $LINK -> prepare("SELECT id, nombre FROM actividad WHERE area = ? AND prioridad = ?");
            $QUERY  ->  bind_param("ss", $filterArea, $filterPriority);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name);

        // By default the query include the three filters
        }else{
            $QUERY  =   $LINK -> prepare("SELECT id, nombre FROM actividad WHERE sector = ? AND area = ? AND prioridad = ?");
            $QUERY  ->  bind_param("sss", $filterLocation, $filterArea, $filterPriority);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($id, $name);
        }
        

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
		    $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

        }else{
            $DATA["ERROR"]      = false;
			$DATA["COUNT"]      = $QUERY->num_rows;
    
			while ( $QUERY -> fetch() ){        
                if($filterArea == ""){
                    array_push($DATA, [
                        'id'    => $id,
                        'name'  => $name,
                        'area'  => $area,
                    ]);
                }else{
                    array_push($DATA, [
                        'id'    => $id,
                        'name'  => $name,
                        'area'  => $filterArea,
                    ]);
                }
			}
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>