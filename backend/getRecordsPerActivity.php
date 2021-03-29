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
    
        $idActivity = $_POST["idActivity"];

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
                            $arrayIndex[$index]     = $i;

                            $index++;
                        }
                    }
                }
                
                if( sizeof($arrayIdRecord) == 0 ){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 34;
                    $DATA["MESSAGE"]    = "La actividad no tiene asociada ningún registro de mantenimiento";

                }else{
                    $QUERY          ->  free_result();
                    $error          =   false;
                    $numImages      =   0;
                    $arrayImages    =   array();

                    for( $i=0; $i<sizeof($arrayIdRecord); $i++ ){
                        $idRecord   = intval($arrayIdRecord[$i]);
                        $index      = intval($arrayIndex[$i]);
                        
                        $LINK   ->  close();
                        $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

                        $QUERY1  =   $LINK -> prepare("SELECT encargado, estados FROM registro WHERE id = ?;");
                        $QUERY1  ->  bind_param('i', $idRecord);
                        $QUERY1  ->  execute();
                        $QUERY1  ->  store_result();
                        $QUERY1  ->  bind_result($username, $stateActivity);
                        $QUERY1  ->  fetch();

                        $LINK   ->  close();
                        $LINK    =  new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

                        $QUERY2  =   $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?");
                        $QUERY2  ->  bind_param('i', $username);
                        $QUERY2  ->  execute();
                        $QUERY2  ->  store_result();
                        $QUERY2  ->  bind_result($name, $lastname);
                        $QUERY2  ->  fetch();

                        if ( $QUERY1->num_rows == 1 && $QUERY2->num_rows == 1 ){
                            
                        // Getting al the images associated to the report
                            $folderRecord   = $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord."/";

                            if(file_exists($folderRecord)){
                                $fileCount      = 0;
                                $files          = glob($folderRecord . "imagen_record_*");

                                if($files){
                                    $fileCount  = count($files);

                                    for( $j=0; $j<$fileCount; $j++ ){
                                        $pathImages     = $folderRecord."imagen_record_".$j.".txt";
                        
                                        if( file_exists( $pathImages ) ){
                                            $file       = fopen($pathImages, "r");
                                            $line       = str_replace("\r\n", "", fgets($file));

                                            if( $idActivity == $line ){
                                                feof($file);
                                                $arrayImages[$numImages]    = fgets($file);
                                                $numImages++;

                                            }
                                                                
                                            fclose($file);
                                        }
                                    }
                                }
                            }

                            $arrayStateActivity    = explode(",", $stateActivity);

                            if( $lastMaintance == $defaultDate ){
                                $lastMaintance    = 'Nunca';
                            }

                            if( $arrayStateActivity[$index] == '1' ){
                                $stateActivity = 'Realizada';
                                
                            }else{
                                $stateActivity = 'Pendiente';

                            }

                            array_push($DATA, [
                                'name'              => $name,
                                'lastname'          => $lastname,
                                'lastMaintance'     => $lastMaintance,
                                'statusActivity'    => $stateActivity,
                                'img'               => $arrayImages,
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