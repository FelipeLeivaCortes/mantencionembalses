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

        $codeArea   = "";
        $workers    = array();

        if( $area == 'Mecánica' ){
            $codeArea   = '0100';
        
        }else if( $area == 'Eléctrica' ){
            $codeArea   = '0010';
        
        }else if( $area == 'Jardinería' ){
            $codeArea   = '0001';
        
        }

        $QUERY  =   $LINK->prepare("SELECT rut, nombre, apellido FROM usuario WHERE permisos = ?;");
        $QUERY  ->  bind_param("s", $codeArea);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($username, $nameUser, $lastnameUser);

        if( $QUERY->num_rows == 0 ){
            $DATA["WARNING"]    = "No se han encontrado especialistas del área ".$area.". Puede derivar la actividad a otro profesional, aunque por temas de seguridad no se recomienda";

            $QUERY  ->  free_result();
            $QUERY  =   $LINK->prepare("SELECT rut, nombre, apellido, permisos FROM usuario WHERE permisos != '1000';");
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($username, $nameUser, $lastnameUser, $permission);

            if( $QUERY->num_rows == 0 ){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 68;
                $DATA["MESSAGE"]    = "No se han encontrado profesionales para realizar la actividad";

            }else{
                while( $QUERY->fetch() ){
                    array_push($workers, [
                        'username'      => $username,
                        'nameUser'      => $nameUser,
                        'lastnameUser'  => $lastnameUser,
                        'permission'    => $permission,
                    ]);
                }

            }
        
        }else{
            $DATA["WARNING"]    = "";

            while( $QUERY->fetch() ){
                array_push($workers, [
                    'username'      => $username,
                    'nameUser'      => $nameUser,
                    'lastnameUser'  => $lastnameUser,
                    'permission'    => $codeArea,
                ]);
            }
        }

        if( sizeof($workers) > 0 ){
            $LINK                   = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
            $found                  = false;
            $activitiesUnavailable  = array();
            $index                  = 0;

            $QUERY  =   $LINK->prepare("SELECT actividades, estados FROM registro WHERE estado = '0';");
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($idActivities, $stateActivities);

            while( $QUERY->fetch() ){
                $arrayAuxId         = explode(",", $idActivities);
                $arrayAuxStates     = explode(",", $stateActivities);

                for( $i=0; $i<sizeof($arrayAuxId); $i++ ){
                    if( $arrayAuxStates[$i] == '0' ){
                        $activitiesUnavailable[$index]  = $arrayAuxId[$i];
                        $index++;
                    }
                }
            }

            for($i=1; $i<=12; $i++){
                $arrayIds           = array();
                $arrayNames         = array();
                $arrayDates         = array();
                $arrayPriorities    = array();

                $SQL        = "";
                $today      = date('Y-m-d');

                if( $priority == "All" ){
                    $SQL    = "SELECT id, nombre, proximaMantencion, sector, prioridad FROM actividad WHERE area = ? AND YEAR(proximaMantencion) = ? AND MONTH(proximaMantencion) = ? AND ultimaMantencion <= ? ORDER BY nombre DESC";
                    $QUERY  =   $LINK->prepare($SQL);
                    $QUERY  ->  bind_param("siis", $area, $year, $i, $today);

                }else{
                    $SQL    = "SELECT id, nombre, proximaMantencion, sector, prioridad FROM actividad WHERE prioridad = ? AND area = ? AND YEAR(proximaMantencion) = ? AND MONTH(proximaMantencion) = ? AND ultimaMantencion <= ? ORDER BY nombre DESC";
                    $QUERY  =   $LINK->prepare($SQL);
                    $QUERY  ->  bind_param("ssiis", $priority, $area, $year, $i, $today);
                }

                $QUERY  ->  execute();
                $QUERY  ->  store_result();
                $QUERY  ->  bind_result($id, $name, $nextMaintance, $location, $priorityResult);

                $index      = 0;
                

                if( $QUERY->num_rows>0 ){
                    $found  = true;
                }

                while( $QUERY->fetch() ){
                    $available  = true;

                    for( $j=0; $j<sizeof($activitiesUnavailable); $j++ ){
                        if( $activitiesUnavailable[$j] == $id ){
                            $available  = false;
                            break;
                        }
                    }

                    if( $available ){
                        $arrayIds[$index]           = $id;
                        $arrayNames[$index]         = $location.": ".$name;
                        $arrayDates[$index]         = $nextMaintance;
                        $arrayPriorities[$index]    = $priorityResult;

                        $index++;
                    }
                    
                }

                array_push($DATA, [
                    'elements'          => $index,
                    'ids'               => $arrayIds,
                    'names'             => $arrayNames,
                    'nextMaintances'    => $arrayDates,
                    'priorities'        => $arrayPriorities, 
                ]);

                $QUERY  -> free_result();
            }

            if( !$found ){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 8;
                $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
            
            }else{
                $DATA["ERROR"]      = false;
                $DATA["workers"]    = $workers;

            }
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>