<?php
    session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{

    /***************************************************************************** */
	/****** ---> DO NOT EDIT THIS UNLESS IT EXTREMELY NECESSARY <--- ************* */
	/***************************************************************************** */

        $USERNAME   = $_SESSION["userDatabase"];
        $PASSWORD   = $_SESSION["passDatabase"];
        $ID_COMPANY = $_SESSION["idCompany"];
        $DATABASE   = "empresa".$ID_COMPANY;
        
        $LINK       ->  close();
        $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

    /***************************************************************************** */
    /***************************************************************************** */
 
        $idRecord           =   $_POST["idRecord"];
        $arrayObservations  =   explode(",", $_POST["arrayObservations"]);
        $arrayStates        =   explode(",", $_POST["arrayStates"]);
        $arrayPiezometria   =   explode(",", $_POST["piezometriaData"]);
        $arrayImportances   =   explode(",", $_POST["arrayImportances"]);

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

            $folderRecord           =   $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord."/";

            if( !file_exists($folderRecord) ){
                mkdir($folderRecord, 0777, true);
            }

            if( !$DATA["ERROR"] ){
                $pathFile               = $folderRecord."record_".$idRecord.".txt";

                if( file_exists( $pathFile ) ){
                    unlink( $pathFile );
                }

                for($i=0; $i<$index; $i++){
                    $idActivity = intval($arrayActivities[$i]);

                    if( $arrayStates[$i] == "1" ){
                        $QUERY  ->  free_result();
                        $QUERY  =   $LINK -> prepare("SELECT nombre, ultimaMantencion, frecuencia FROM actividad WHERE id = ?");
                        $QUERY  ->  bind_param("i", $idActivity);
                        $QUERY  ->  execute();
                        $QUERY  ->  store_result();
                        $QUERY  ->  bind_result($nameActivity, $lastMaintance, $frecuencyActivity);
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
                                    'operation'         => 'Update',
                                    'statusActivity'    => 'OK',
                                ]);
                                
                                $arrayStatesOriginal[$i]    = "1";
                                $success++;

                                if( $nameActivity == 'realizar piezometría' ){
                                    $cota       =   $arrayPiezometria[0];
                                    $pcg1       =   $arrayPiezometria[1];
                                    $pcg2       =   $arrayPiezometria[2];
                                    $pcg3       =   $arrayPiezometria[3];
                                    $pcg4       =   $arrayPiezometria[4];
                                    $pcg5       =   $arrayPiezometria[5];
                                    $pcg6       =   $arrayPiezometria[6];
                                    $pcg7       =   $arrayPiezometria[7];
                                    $pcg8       =   $arrayPiezometria[8];
                                    $pcg9       =   $arrayPiezometria[9];
                                    $pcg10      =   $arrayPiezometria[10];
                                    $pcg11      =   $arrayPiezometria[11];
                                    $pcg12      =   $arrayPiezometria[12];
                                    $pcg13      =   $arrayPiezometria[13];
                                    $pcg14      =   $arrayPiezometria[14];

                                    $QUERY  =   $LINK -> prepare("INSERT INTO piezometria (fecha, cota, pcg1, pcg2, pcg3, pcg4, pcg5, 
                                                pcg6, pcg7, pcg8, pcg9, pcg10, pcg11, pcg12, pcg13, pcg14) VALUES (?, ?, ?, ?, ?, ?, 
                                                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");
                                    $QUERY  ->  bind_param("sddddddddddddddd", $today, $cota, $pcg1, $pcg2, $pcg3, $pcg4,
                                                $pcg5, $pcg6, $pcg7, $pcg8, $pcg9, $pcg10, $pcg11, $pcg12, $pcg13, $pcg14);
                                    $QUERY  ->  execute();
                                    

                                    if( $QUERY->affected_rows != 1 ){
                                        array_push($DATA, [
                                            'idActivity'        => $idActivity,
                                            'operation'         => 'Update Piezometría',
                                            'statusActivity'    => 'ERROR',
                                        ]);
                                        $error  = true;
                                        break;
                                    }

                                }

                            }else{
                                array_push($DATA, [
                                    'idActivity'        => $idActivity,
                                    'operation'         => 'Update',
                                    'statusActivity'    => 'ERROR',
                                ]);
                                $error  = true;
                                break;
                            }
                        }

                    }

                    if( file_exists( $pathFile ) ){
                        $file   = fopen( $pathFile, "a");
                        $line   = str_replace("|", ",", $arrayObservations[$i]);
                        fwrite($file, PHP_EOL.$idActivity."|".$line);
                        fclose($file);
                    
                    }else{
                        $file   = fopen( $pathFile, "w");
                        $line   = str_replace("|", ",", $arrayObservations[$i]);
                        fwrite($file, $idActivity."|".$line);
                        fclose($file);
                        
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

                    if( $finished ){
                        $QUERY  	=   $LINK -> prepare("UPDATE registro SET fechaTermino = ?, estado = 1 WHERE id = ?;");
                        $QUERY  	->	bind_param('si', $today, $idRecord);
                        $QUERY  	->  execute();
                        
                        if( $QUERY->affected_rows != 1 ){
                            $DATA["ERROR"] 		= true;
                            $DATA["ERRNO"]      = 3;
                            $DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                        }

                    }

                    $stringStates       =   implode(",", $arrayStatesOriginal);
                    $stringImportances  =   implode(",", $arrayImportances);

                    $QUERY  	=   $LINK -> prepare("UPDATE registro SET estados = ?, importancias = ? WHERE id = ?");
                    $QUERY  	->	bind_param('ssi', $stringStates, $stringImportances, $idRecord);
                    $QUERY  	->  execute();
                    
                    if( $QUERY->affected_rows == 1 ){
                        $DATA["ERROR"] 		= false;
                        $DATA["MESSAGE"]	= "Se han registrado los datos exitosamente";
                    
                    }else{
                        $DATA["ERROR"] 		= true;
                        $DATA["ERRNO"]      = 3;
                        $DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                    }

                    $empty  = true;

                    for( $i=0; $i<sizeof($arrayObservations); $i++ ){
                        if( $arrayObservations[$i] != '' ){
                            $empty  = false;
                            break;
                        }
                    }
                    
                    if( !$empty ){
                        $DATA["ERROR"] 		= false;
                        $DATA["MESSAGE"]	= "Se han registrado los datos exitosamente";

                    }else{
                        $DATA["ERROR"] 		= false;
                        $DATA["MESSAGE"]	= "No se han ingresado observaciones";

                    }
                }
            }
        }

        $QUERY  -> free_result();
		$LINK   -> close();
    }
    header('Content-Type: application/json');
	echo json_encode($DATA);
?>