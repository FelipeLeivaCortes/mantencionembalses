<?php
    session_start();
    include "configuration.php";
    
	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany          = $_POST["idCompany"];
        $arrayIdActivities  = explode(",", $_POST["arrayIdActivities"]);

        $LINK   = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

        $today  = date('Y-m-d');
        $error  = false;

        for( $i=0; $i<sizeof($arrayIdActivities); $i++ ){
            $idActivity     = $arrayIdActivities[$i];

            $QUERY  =   $LINK -> prepare("SELECT nombre, sector, prioridad, observacion FROM actividad WHERE id = ?");
            $QUERY  ->  bind_param("i", $idActivity);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
//            $QUERY  ->  bind_result($name, $location, $lastMaintance, $priority, $comments);
            $QUERY  ->  bind_result($name, $location, $priority, $comments);
            $QUERY  ->  fetch();

            if( $QUERY->num_rows == 0 ){
                $DATA["ERRPR"]      = true;
                $DATA["ERRNO"]      = 8;
                $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
                $error              = true;

                break;

            }else{
              /*  $daysLate   = "";
                
                if( $lastMaintance == $defaultDate){
                    $lastMaintance  = "Nunca";
                    $daysLate       = "Nunca";
                
                }else{
                    $today      = new DateTime("now");
                    $dateAux    = new DateTime($lastMaintance);
                    $daysLate   = date_diff($dateAux, $today)->format('%a');
        
                }
*/
                array_push($DATA, [
                    'id'            => $idActivity,
                    'name'          => $name,
                    'location'      => $location,
//                    'lastMaintance' => $lastMaintance,
//                    'daysLate'      => $daysLate,
                    'priority'      => $priority,
                    'comments'      => $comments,
                ]);

            }

        }

        if( !$error ){
            $DATA["ERROR"]  = false;
            $DATA["COUNT"]  = $i;
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>