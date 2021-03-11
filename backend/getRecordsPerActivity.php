<?php
    session_start();
    include "configuration.php";
    
	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $idActivity = $_POST["idActivity"];

        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

        $QUERY  =   $LINK -> prepare("SELECT nombre, area, ultimaMantencion FROM actividad WHERE id = ?;");
        $QUERY  ->	bind_param('i', $idActivity);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($nameActivity, $areaActivity, $lastMaintance);
        $QUERY  ->  fetch();

        if( $QUERY->num_rows == 1 ){
            $QUERY  ->  free_result();
            $QUERY  =   $LINK -> prepare("SELECT id, actividades FROM registro");
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($idRecord, $activityList);

            if( $QUERY->num_rows == 0 ){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 71;
                $DATA["MESSAGE"]    = "No se han encontrado registros de mantenciones en el sistema";

            }else{
                $arrayIdRecord      = array();
                $arrayIndex         = array();
                $index              = 0;

                while ( $QUERY->fetch() ){
                    $arrayIdActivities  = explode(",", $activityList);
                    
                    for($i=0; $i<sizeof($arrayIdActivities); $i++){
                        $idActivityAux  = intval($arrayIdActivities[$i]);
                        
                        if( $idActivity == $idActivityAux ){
                            $arrayIdRecord[$index]  = $idRecord;
                            $arrayIndex[$index]   = $i;

                            $index++;
                        }
                    }
                }
                
                if( sizeof($arrayIdRecord) == 0 ){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 34;
                    $DATA["MESSAGE"]    = "La actividad no tiene asociada ningún registro de mantenimiento";

                }else{
                    $QUERY  ->  free_result();
                    $error  =   false;

                    for( $i=0; $i<sizeof($arrayIdRecord); $i++ ){
                        $idRecord   = intval($arrayIdRecord[$i]);
                        
                        $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

                        $QUERY1  =   $LINK -> prepare("SELECT encargado, fechaInicio, estados FROM registro WHERE id = ?;");
                        $QUERY1  ->  bind_param('i', $idRecord);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($username, $startDate, $stateActivity);
                        $QUERY1  ->  fetch();

                        $LINK    =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

                        $QUERY2  =   $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?");
                        $QUERY2  ->  bind_param('i', $username);
                        $QUERY2  ->  execute();
                        $QUERY2  ->  store_result();
                        $QUERY2  ->  bind_result($name, $lastname);
                        $QUERY2  ->  fetch();

                        if ( $QUERY1->num_rows == 1 && $QUERY2->num_rows == 1 ){
                            $arrayStateActivity    = explode(",", $stateActivity);

                            if( $lastMaintance == $defaultDate ){
                                $lastMaintance    = 'Nunca';
                            }

                            if( $arrayStateActivity[$i] == '1' ){
                                $stateActivity = 'Terminada';
                                
                            }else{
                                $stateActivity = 'Pendiente';

                            }

                            array_push($DATA, [
                                'name'              => $name,
                                'lastname'          => $lastname,
                                'startDate'         => $startDate,
                                'lastMaintance'     => $lastMaintance,
                                'statusActivity'    => $stateActivity,
                            ]);
                        
                        }else{
                            $DATA["ERROR"]      = true;
                            $DATA["ERRNO"]      = 10;
                            $DATA["MESSAGE"]    = "Se ha producido un error con la operación id: ". $idRecord .".Comuníquese con el administrador";

                            $error      = true;
                            break;
                        }
                    }

                    if( !$error ){
                        $DATA["ERROR"]      = false;
                        $DATA["COUNT"]      = sizeof($arrayIdRecord);

                        $DATA["nameActivity"]   = $nameActivity;
                        $DATA["areaActivity"]   = $areaActivity;
                    }
                    
                }
            }

        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 72;
            $DATA["MESSAGE"]    = "La actividad con id: no existe. Comuníquese con el administrador";

        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>