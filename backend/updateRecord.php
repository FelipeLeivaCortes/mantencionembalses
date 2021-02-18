<?php
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  =   $_POST["idCompany"];
        $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
        $idRecord   = 	$_POST["id"];

        $QUERY  =   $LINK -> prepare("SELECT actividades FROM registro WHERE id = ?");
        $QUERY  ->  bind_param("i", $idRecord);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($arrayAux);
        $QUERY  ->  fetch();

        if( $QUERY->num_rows != 1 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 31;
		    $DATA["MESSAGE"]    = "Se han encontrado registros duplicados, o el registro no existente, con el id: " . $idRecord . ". Comuníquese con el administrador";

        }else{
            $arrayActivities    = explode(",", $arrayAux);
            $error              = false;
            $DATA["ERROR"]      = false;
            $idActivity         = 0;
            $today	            = date('Y-m-d');

            for($i=0; $i<sizeof($arrayActivities); $i++){
                $idActivity = intval($arrayActivities[$i]);

                $QUERY  ->  free_result();
                $QUERY  =   $LINK -> prepare("SELECT ultimaMantencion, frecuencia FROM actividad WHERE id = ?");
                $QUERY  ->  bind_param("i", $idActivity);
                $QUERY  ->  execute();
                $QUERY  ->  store_result();
                $QUERY  ->  bind_result($lastMaintance, $frecuencyActivity);
                $QUERY  ->  fetch();

                if($lastMaintance == $today){
                    array_push($DATA, [
                        'idActivity'        => $idActivity,
                        'operation'         => 'update',
                        'statusActivity'    => 'Error',
                        'message'           => 'La actividad con id: ' . $idActivity . ' ya fue modificada hoy',
                    ]);
                
                }else if( $QUERY->num_rows != 1 ){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 32;
                    $DATA["MESSAGE"]    = "Se han encontrado actividades duplicadas, o la actividad no existente, con el id: " . $idActivity . ". Comuníquese con el administrador";
                    break;

                }else{
                    $nextMaintein   =   date('Y-m-d', strtotime($today.'+ '.$frecuencyActivity.' days'));

                    $QUERY      ->  free_result();
                    $QUERY  	=   $LINK -> prepare("UPDATE actividad SET ultimaMantencion = ?, proximaMantencion = ? WHERE id = ?");
                    $QUERY  	->	bind_param('ssi', $today, $nextMaintein, $idActivity);
                    $QUERY  	->  execute();

                    $DATA["test"]   = $QUERY->affected_rows;
                    if( $QUERY->affected_rows == 1 ){
                        array_push($DATA, [
                            'idActivity'        => $idActivity,
                            'operation'         => 'update',
                            'statusActivity'    => 'OK',
                        ]);
                    
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

            if($DATA["ERROR"] == false && $error == true){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 10;
                $DATA["MESSAGE"]    = "Se ha producido un error con la actividad de id: " . $idActivity . ". Comuníquese con el administrador";
            }
            
            if(!$DATA["ERROR"] && !$error){
                $QUERY  	=   $LINK -> prepare("UPDATE registro SET fechaTermino = ?, estado = 1 WHERE id = ?");
                $QUERY  	->	bind_param('si', $today, $idRecord);
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