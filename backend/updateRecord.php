<?php
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany          =   $_POST["idCompany"];
        $idRecord           =   $_POST["idRecord"];
        $arrayObservations  =   explode(",", $_POST["arrayObservations"]);
        $arrayStates        =   explode(",", $_POST["arrayStates"]);

        $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, "empresa".$idCompany);

        $QUERY  =   $LINK -> prepare("SELECT actividades, estados FROM registro WHERE id = ?");
        $QUERY  ->  bind_param("i", $idRecord);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($arrayAux1, $arrayAux2);
        $QUERY  ->  fetch();

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
      
        }else if( $QUERY->num_rows > 1){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 9;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
   
        }else{
            $index                  =   sizeof($arrayStates);
            $arrayActivities        =   explode(",", $arrayAux1);
            $arrayStatesOriginal    =   explode(",", $arrayAux2);
            $error                  =   false;
            $DATA["ERROR"]          =   false;
            $idActivity             =   0;
            $success                =   0;
            $today	                =   date('Y-m-d');

            for($i=0; $i<$index; $i++){
                if( $arrayStates[$i] == "1" ){
                    $idActivity = intval($arrayActivities[$i]);

                    $QUERY  ->  free_result();
                    $QUERY  =   $LINK -> prepare("SELECT ultimaMantencion, frecuencia FROM actividad WHERE id = ?");
                    $QUERY  ->  bind_param("i", $idActivity);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($lastMaintance, $frecuencyActivity);
                    $QUERY  ->  fetch();

                    if( $lastMaintance == $today ){
                        array_push($DATA, [
                            'idActivity'        => $idActivity,
                            'operation'         => 'update',
                            'statusActivity'    => 'Error',
                            'message'           => 'La actividad con id: '.$idActivity.' ya fue modificada hoy',
                        ]);
                    
                    }else if( $QUERY->num_rows != 1 ){
                        $DATA["ERROR"]      = true;
                        $DATA["ERRNO"]      = 32;
                        $DATA["MESSAGE"]    = "Se han encontrado actividades duplicadas, o la actividad no existente, con el id: " . $idActivity . ". Comuníquese con el administrador";
                        break;

                    }else{
                        $nextMaintein   =   date('Y-m-d', strtotime($today.'+ '.$frecuencyActivity.' days'));

                        $QUERY      ->  free_result();
                        $QUERY  	=   $LINK -> prepare("UPDATE actividad SET ultimaMantencion = ?, proximaMantencion = ? WHERE id = ?;");
                        $QUERY  	->	bind_param('ssi', $today, $nextMaintein, $idActivity);
                        $QUERY  	->  execute();

                        if( $QUERY->affected_rows == 1 ){
                            array_push($DATA, [
                                'idActivity'        => $idActivity,
                                'operation'         => 'update',
                                'statusActivity'    => 'OK',
                            ]);
                            
                            $arrayStatesOriginal[$i]    = "1";
                            $success++;

                            if( file_exists( $PATH_FILES.$idCompany."/record_".$idRecord.".txt" ) ){
                                $file   = fopen( $PATH_FILES.$idCompany."/record_".$idRecord.".txt", "a");
                                fwrite($file, $idActivity."|".$arrayObservations[$i].PHP_EOL);
                                fclose($file);
                            
                            }else{
                                $file   = fopen( $PATH_FILES.$idCompany."/record_".$idRecord.".txt", "w");
                                fwrite($file, $idActivity."|".$arrayObservations[$i].PHP_EOL);
                                fclose($file);
                            }

                        }else{
                            array_push($DATA, [
                                'idActivity'        => $idActivity,
                                'operation'         => 'update',
                                'statusActivity'    => 'ERROR',
                            ]);
                            $error  = true;
                            break;
                        }
                    }
                }
            }

            if( !$DATA["ERROR"] && $error ){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 10;
                $DATA["MESSAGE"]    = "Se ha producido un error con la actividad de id: " . $idActivity . ". Comuníquese con el administrador";
            
            }else{
            
                $finished   = true;

                for($i=0; $i<sizeof($arrayStatesOriginal); $i++){
                    if( $arrayStatesOriginal[$i] == "0" ){
                        $finished   = false;
                        break;
                    }
                }

                if( !$DATA["ERROR"] && !$error && $finished ){
                    $QUERY  	=   $LINK -> prepare("UPDATE registro SET fechaTermino = ?, estado = 1 WHERE id = ?;");
                    $QUERY  	->	bind_param('si', $today, $idRecord);
                    $QUERY  	->  execute();
                    
                    if( $QUERY->affected_rows != 1 ){
                        $DATA["ERROR"] 		= true;
                        $DATA["ERRNO"]      = 3;
                        $DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                    }

                }

                $stringStates   =   implode(",", $arrayStatesOriginal);

                $QUERY  	=   $LINK -> prepare("UPDATE registro SET estados = ? WHERE id = ?");
                $QUERY  	->	bind_param('si', $stringStates, $idRecord);
                $QUERY  	->  execute();
                
                if( $QUERY->affected_rows == 1 ){
                    $DATA["ERROR"] 		= false;
                    $DATA["MESSAGE"]	= "Se han modificado los datos exitosamente";
                
                }else{
                    $DATA["ERROR"] 		= true;
                    $DATA["ERRNO"]      = 3;
                    $DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                }
            }

        }

        $QUERY  -> free_result();
		$LINK   -> close();
    }
    header('Content-Type: application/json');
	echo json_encode($DATA);
?>