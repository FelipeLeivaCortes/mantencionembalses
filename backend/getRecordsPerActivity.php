<?php
    session_start();
    include "configuration.php";
    
	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
        $idActivity = $_POST["idActivity"];

        $QUERY  =   $LINK -> prepare("SELECT id, actividades FROM registro");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($idRecord, $activityList);

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
		    $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

        }else{
            $arrayIdRecord      = array();
            $index              = 0;

			while ( $QUERY->fetch() ){
                $arrayIds       = explode(",", $activityList);
                
                for($i=0; $i<sizeof($arrayIds); $i++){
                    $idActivityAux  = intval($arrayIds[$i]);
                    
                    if($idActivityAux == $idActivity){
                        $arrayIdRecord[$index]  = $idRecord;
                        $index++;
                    }
                }
            }
            
            if( sizeof($arrayIdRecord) == 0 ){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 34;
                $DATA["MESSAGE"]    = "La actividad no tiene asociada ningún registro de mantenimiento";

            }else{
                $QUERY      ->  free_result();

                for($i=0; $i<sizeof($arrayIdRecord); $i++){
                    $idRecord   = $arrayIdRecord[$i];

                    $QUERY  =   $LINK -> prepare("SELECT encargado, fechaInicio, fechaTermino, estado FROM registro WHERE id = ?");
                    $QUERY  ->	bind_param('i', $idRecord);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($username, $startDate, $endDate, $statusRecord);
                    $QUERY  ->  fetch();

                    $LINK    =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);
                    $QUERY2  =   $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?");
                    $QUERY2  ->  bind_param('i', $username);
                    $QUERY2  ->  execute();
                    $QUERY2  ->  store_result();
                    $QUERY2  ->  bind_result($name, $lastname);
                    $QUERY2  ->  fetch();

                    if ( $QUERY->num_rows == 1 && $QUERY2->num_rows == 1 ){
                        array_push($DATA, [
                            'name'          => $name,
                            'lastname'      => $lastname,
                            'startDate'     => $startDate,
                            'endDate'       => $endDate,
                            'statusRecord'  => $statusRecord,
                        ]);
                    }
                }

                $DATA["ERROR"]      = false;
			    $DATA["count"]      = sizeof($arrayIdRecord);
            }
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>