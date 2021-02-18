<?php
    session_start();
    include "configuration.php";

	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
           $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
           $idCompany      = $_POST["idCompany"];
           $username       = $_POST["username"];
           $amount         = $_POST["amount"];
           $priorityFilter = $_POST["priorityFilter"];
           $locationFilter = $_POST["locationFilter"];

           $QUERY  =   $LINK -> prepare("SELECT permisos FROM usuario WHERE rut = ?");
           $QUERY  ->  bind_param("i", $username);
           $QUERY  ->  execute();
           $QUERY  ->  store_result();
           $QUERY  ->  bind_result($permissions);
           $QUERY  ->  fetch();

           if( $QUERY->num_rows == 0 ){
              $DATA["ERROR"]      = true;
              $DATA["ERRNO"]      = 4;
	      $DATA["MESSAGE"]    = "El rut ingresado no está registrado";

           }else{

	      $LINK -> close();
              $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

            $list           = str_split($permissions);
            $amountHigh     = 0;
            $amountMedium   = 0;
            $amountLow      = 0;
            $today          = date('Y-m-d');
            $area;

            // If the person is mechanical
            if($list[0] == "0" && $list[1] == "1" && $list[2] == "0" && $list[3] == "0"){
                $area   =   "Mecánica";
            
            }else if($list[0] == "0" && $list[1] == "0" && $list[2] == "1" && $list[3] == "0"){
                $area   =   "Eléctrica";

            }else if($list[0] == "0" && $list[1] == "0" && $list[2] == "0" && $list[3] == "1"){
                $area   =   "Jardinería";
            }

            $QUERY  ->  free_result();
            $DATA["amount"]     = $amount;
            $DATA["priority"]   = $priorityFilter;
            $DATA["location"]   = $locationFilter;

            // Selecting all the quantities
            if($amount == "All"){

                if($priorityFilter == "" && $locationFilter == ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad 
				WHERE area = ? AND proximaMantencion < ? AND fechaInicio <= ? 
				ORDER BY CASE prioridad WHEN prioridad = 'Alta' THEN 1 WHEN prioridad = 'Media' THEN 2 WHEN prioridad = 'Baja' THEN 3 END DESC;");
                    $QUERY  ->  bind_param("sss", $area, $today, $today);
                
                }else if($priorityFilter == "" && $locationFilter != ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad
				WHERE area = ? AND proximaMantencion < ? AND sector = ? AND fechaInicio <= ? 
				ORDER BY CASE prioridad WHEN prioridad = 'Alta' THEN 1 WHEN prioridad = 'Media' THEN 2 WHEN prioridad = 'Baja' THEN 3 END DESC;");
                    $QUERY  ->  bind_param("ssss", $area, $today, $locationFilter, $today);

                }else if($priorityFilter != "" && $locationFilter == ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE area = ? AND prioridad = ? AND proximaMantencion < ? AND fechaInicio <= ?;");
                    $QUERY  ->  bind_param("ssss", $area, $priorityFilter, $today, $today);

                }else if($priorityFilter != "" && $locationFilter != ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE area = ? AND prioridad = ? AND proximaMantencion < ? AND sector = ? AND fechaInicio <= ?;");
                    $QUERY  ->  bind_param("sssss", $area, $priorityFilter, $today, $locationFilter, $today);
                }

                $QUERY  ->  execute();
                $QUERY  ->  store_result();
                $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                while( $QUERY -> fetch() ){
                    $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                    $QUERY1  ->  bind_param("s", $today);
                    $QUERY1  ->  execute();
                    $QUERY1  ->  store_result();
                    $QUERY1  ->  bind_result($arrayActivities);

                    if( $nextMaintance == $defaultDate){
                        $nextMaintance  = "Nunca";
                        $days           = "Nunca";
                    
                    }else{
                        $today      = new DateTime("now");
                        $dateAux    = new DateTime($nextMaintance);
                        $days       = date_diff($dateAux, $today)->format('%a');
            
                    }
            
                    $found = false;

                    while( $QUERY1->fetch() ){
                        $activitiesIds  = explode(",", $arrayActivities);

                        for($i=0; $i<sizeof($activitiesIds); $i++){
                            $idAux  = intval($activitiesIds[$i]);

                            if( $idAux == $id ){
                                $found  = true;
                                break;
                            }
                        }
                    }

                    if(!$found){
                        $amountHigh++;
                        array_push($DATA, [
                            'id'            => $id,
                            'name'          => $name,
                            'location'      => $location,
                            'nextMaintance' => $nextMaintance,
                            'days'          => $days,
                            'priority'      => $priority,
                            'notes'         => $notes,
                        ]);
                    }
                    
                }

            // If the user set a amount of result
            }else{

                if($priorityFilter == "Alta" && $locationFilter == ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Alta' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("sssi", $area, $today, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountHigh++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                }else if($priorityFilter == "Alta" && $locationFilter != ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Alta' AND area = ? AND proximaMantencion < ? AND sector = ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("ssssi", $area, $today, $locationFilter, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountHigh++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                }else if($priorityFilter == "Media" && $locationFilter == ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Media' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("sssi", $area, $today, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountMedium++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                }else if($priorityFilter == "Media" && $locationFilter != ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Media' AND area = ? AND proximaMantencion < ? AND sector = ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("ssssi", $area, $today, $locationFilter, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountMedium++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                }else if($priorityFilter == "Baja" && $locationFilter == ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Baja' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("sssi", $area, $today, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountLow++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                }else if($priorityFilter == "Baja" && $locationFilter != ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Baja' AND area = ? AND proximaMantencion < ? AND sector = ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("ssssi", $area, $today, $locationFilter, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountLow++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }            
        
                }else if($priorityFilter == "" && $locationFilter != ""){
                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Alta' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? AND sector = ? LIMIT ?");
                    $QUERY  ->  bind_param("ssssi", $area, $today, $today, $locationFilter, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountHigh++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                    // If we have less that amount, is necessary include the medium priority 
                    if($amountHigh < $amount){
                        $deltaA =   $amount - $amountHigh;
                        $QUERY  ->  free_result();
                        $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Media' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? AND sector = ? LIMIT ?");
                        $QUERY  ->  bind_param("ssssi", $area, $today, $today, $locationFilter, $deltaA);
                        $QUERY  ->  execute();
                        $QUERY  ->  store_result();
                        $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                        while ($QUERY -> fetch()){

                            $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                            $QUERY1  ->  bind_param("s", $today);
                            $QUERY1  ->  execute();
                            $QUERY1  ->  store_result();
                            $QUERY1  ->  bind_result($arrayActivities);
        
                            if($nextMaintance == $defaultDate){
                                $nextMaintance  = "Nunca";
                                $days           = "Nunca";
                            
                            }else{
                                $today      = new DateTime("now");
                                $dateAux    = new DateTime($nextMaintance);
                                $days       = date_diff($dateAux, $today)->format('%a');
                    
                            }
                    
                            $found = false;
        
                            while( $QUERY1->fetch() ){
                                $activitiesIds  = explode(",", $arrayActivities);
        
                                for($i=0; $i<sizeof($activitiesIds); $i++){
                                    $idAux  = intval($activitiesIds[$i]);
        
                                    if( $idAux == $id ){
                                        $found  = true;
                                        break;
                                    }
                                }
                            }
        
                            if(!$found){
                                $amountMedium++;
                                array_push($DATA, [
                                    'id'            => $id,
                                    'name'          => $name,
                                    'location'      => $location,
                                    'nextMaintance' => $nextMaintance,
                                    'days'          => $days,
                                    'priority'      => $priority,
                                    'notes'         => $notes,
                                ]);
                            }
                            
                        }
                        
                        // If we have less that amount, is necessary include the lowest priority 
                        if($amountMedium < ($amount - $amountHigh)){
                            $deltaB =   $amount - ($amountHigh + $amountMedium);
                            $QUERY  ->  free_result();
                            $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Baja' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? AND sector = ? LIMIT ?");
                            $QUERY  ->  bind_param("ssssi", $area, $today, $today, $locationFilter, $deltaB);
                            $QUERY  ->  execute();
                            $QUERY  ->  store_result();
                            $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                            while ($QUERY -> fetch()){

                                $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                                $QUERY1  ->  bind_param("s", $today);
                                $QUERY1  ->  execute();
                                $QUERY1  ->  store_result();
                                $QUERY1  ->  bind_result($arrayActivities);
            
                                if($nextMaintance == $defaultDate){
                                    $nextMaintance  = "Nunca";
                                    $days           = "Nunca";
                                
                                }else{
                                    $today      = new DateTime("now");
                                    $dateAux    = new DateTime($nextMaintance);
                                    $days       = date_diff($dateAux, $today)->format('%a');
                        
                                }
                        
                                $found = false;
            
                                while( $QUERY1->fetch() ){
                                    $activitiesIds  = explode(",", $arrayActivities);
            
                                    for($i=0; $i<sizeof($activitiesIds); $i++){
                                        $idAux  = intval($activitiesIds[$i]);
            
                                        if( $idAux == $id ){
                                            $found  = true;
                                            break;
                                        }
                                    }
                                }
            
                                if(!$found){
                                    $amountLow++;
                                    array_push($DATA, [
                                        'id'            => $id,
                                        'name'          => $name,
                                        'location'      => $location,
                                        'nextMaintance' => $nextMaintance,
                                        'days'          => $days,
                                        'priority'      => $priority,
                                        'notes'         => $notes,
                                    ]);
                                }
                                
                            }
                        }
                    }

                }else{

                    $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Alta' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? LIMIT ?");
                    $QUERY  ->  bind_param("sssi", $area, $today, $today, $amount);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                    while ($QUERY -> fetch()){

                        $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                        $QUERY1  ->  bind_param("s", $today);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($arrayActivities);
    
                        if($nextMaintance == $defaultDate){
                            $nextMaintance  = "Nunca";
                            $days           = "Nunca";
                        
                        }else{
                            $today      = new DateTime("now");
                            $dateAux    = new DateTime($nextMaintance);
                            $days       = date_diff($dateAux, $today)->format('%a');
                
                        }
                
                        $found = false;
    
                        while( $QUERY1->fetch() ){
                            $activitiesIds  = explode(",", $arrayActivities);
    
                            for($i=0; $i<sizeof($activitiesIds); $i++){
                                $idAux  = intval($activitiesIds[$i]);
    
                                if( $idAux == $id ){
                                    $found  = true;
                                    break;
                                }
                            }
                        }
    
                        if(!$found){
                            $amountHigh++;
                            array_push($DATA, [
                                'id'            => $id,
                                'name'          => $name,
                                'location'      => $location,
                                'nextMaintance' => $nextMaintance,
                                'days'          => $days,
                                'priority'      => $priority,
                                'notes'         => $notes,
                            ]);
                        }
                        
                    }

                    // If we have less that amount, is necessary include the medium priority 
                    if($amountHigh < $amount){
                        $deltaA =   $amount - $amountHigh;
                        $QUERY  ->  free_result();
                        $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Media' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? LIMIT ?");
                        $QUERY  ->  bind_param("sssi", $area, $today, $today, $deltaA);
                        $QUERY  ->  execute();
                        $QUERY  ->  store_result();
                        $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                        while ($QUERY -> fetch()){

                            $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                            $QUERY1  ->  bind_param("s", $today);
                            $QUERY1  ->  execute();
                            $QUERY1  ->  store_result();
                            $QUERY1  ->  bind_result($arrayActivities);
        
                            if($nextMaintance == $defaultDate){
                                $nextMaintance  = "Nunca";
                                $days           = "Nunca";
                            
                            }else{
                                $today      = new DateTime("now");
                                $dateAux    = new DateTime($nextMaintance);
                                $days       = date_diff($dateAux, $today)->format('%a');
                    
                            }
                    
                            $found = false;
        
                            while( $QUERY1->fetch() ){
                                $activitiesIds  = explode(",", $arrayActivities);
        
                                for($i=0; $i<sizeof($activitiesIds); $i++){
                                    $idAux  = intval($activitiesIds[$i]);
        
                                    if( $idAux == $id ){
                                        $found  = true;
                                        break;
                                    }
                                }
                            }
        
                            if(!$found){
                                $amountMedium++;
                                array_push($DATA, [
                                    'id'            => $id,
                                    'name'          => $name,
                                    'location'      => $location,
                                    'nextMaintance' => $nextMaintance,
                                    'days'          => $days,
                                    'priority'      => $priority,
                                    'notes'         => $notes,
                                ]);
                            }
                            
                        }
                        
                        // If we have less that amount, is necessary include the lowest priority 
                        if($amountMedium < ($amount - $amountHigh)){
                            $deltaB =   $amount - ($amountHigh + $amountMedium);
                            $QUERY  ->  free_result();
                            $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector, proximaMantencion, prioridad, observacion FROM actividad WHERE prioridad = 'Baja' AND area = ? AND proximaMantencion < ? AND fechaInicio <= ? LIMIT ?");
                            $QUERY  ->  bind_param("sssi", $area, $today, $today, $deltaB);
                            $QUERY  ->  execute();
                            $QUERY  ->  store_result();
                            $QUERY  ->  bind_result($id, $name, $location, $nextMaintance, $priority, $notes);

                            while ($QUERY -> fetch()){

                                $QUERY1  =   $LINK->prepare("SELECT actividades FROM registro WHERE fechaInicio = ?");
                                $QUERY1  ->  bind_param("s", $today);
                                $QUERY1  ->  execute();
                                $QUERY1  ->  store_result();
                                $QUERY1  ->  bind_result($arrayActivities);
            
                                if($nextMaintance == $defaultDate){
                                    $nextMaintance  = "Nunca";
                                    $days           = "Nunca";
                                
                                }else{
                                    $today      = new DateTime("now");
                                    $dateAux    = new DateTime($nextMaintance);
                                    $days       = date_diff($dateAux, $today)->format('%a');
                        
                                }
                        
                                $found = false;
            
                                while( $QUERY1->fetch() ){
                                    $activitiesIds  = explode(",", $arrayActivities);
            
                                    for($i=0; $i<sizeof($activitiesIds); $i++){
                                        $idAux  = intval($activitiesIds[$i]);
            
                                        if( $idAux == $id ){
                                            $found  = true;
                                            break;
                                        }
                                    }
                                }
            
                                if(!$found){
                                    $amountLow++;
                                    array_push($DATA, [
                                        'id'            => $id,
                                        'name'          => $name,
                                        'location'      => $location,
                                        'nextMaintance' => $nextMaintance,
                                        'days'          => $days,
                                        'priority'      => $priority,
                                        'notes'         => $notes,
                                    ]);
                                }
                                
                            }
                        }
                    }
                }
            }

            if( $amountHigh ==  0 && $amountMedium == 0 && $amountLow == 0){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 8;
		        $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
            }else{
                $DATA["ERROR"]      = false;
                $DATA["COUNT"]      = $amountHigh + $amountMedium + $amountLow;
            }
        }
    
        $QUERY ->  free_result();
		$LINK   ->  close();
    }
    
    header('Content-Type: application/json');
    echo json_encode($DATA);
?>
