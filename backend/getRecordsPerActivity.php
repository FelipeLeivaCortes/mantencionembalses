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

        $data		=	array(
            "type"			=>	"SELECT",
            "query"			=>	"SELECT nombre, area, ultimaMantencion FROM actividad WHERE id = ?;",
            "parameters"	=>	array(
                                    "i",
                                    $idActivity
            )
        );
        $result1	=	query($LINK, $data, false);

        if(sizeof($result1) == 0){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

        }else if(sizeof($result1) > 1){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 5;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";
        
        }else{
            $data		=	array(
                "type"			=>	"SELECT",
                "query"			=>	"SELECT id, actividades FROM registro",
                "parameters"	=>	""
            );
            $result2	=	query($LINK, $data, false);
    
            if(sizeof($result2) == 0){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 8;
                $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

            }else{
                $arrayIdRecord      = array();
                $arrayIndex         = array();
                $index              = 0;

                // MATCHING THE ACTIVITY WITH THE ACTIVITIES RECORDED IN THE RECORDS
                for($i=0; $i<sizeof($result2); $i++){
                    $arrayIdActivities  = explode(",", $result2[$i]["actividades"]);
                    
                    for($j=0; $j<sizeof($arrayIdActivities); $j++){

                        if($idActivity == intval($arrayIdActivities[$j])){
                            $arrayIdRecord[$index]  = $result2[$i]["id"];
                            $arrayIndex[$index]     = $j;

                            $index++;
                        }
                    }
                }

                if(sizeof($arrayIdRecord) == 0){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 34;
                    $DATA["MESSAGE"]    = "La actividad no tiene asociada ningún registro de mantenimiento";

                }else{
                    $error          =   false;

                    for($i=0; $i<sizeof($arrayIdRecord); $i++){
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

                        if($QUERY1->num_rows == 1 && $QUERY2->num_rows == 1){
                            $arrayStateActivity    = explode(",", $stateActivity);

                            if( $lastMaintance == $defaultDate ){
                                $lastMaintance    = 'Nunca';
                            }

                            if( $arrayStateActivity[$index] == '1' ){
                                $stateActivity = 'Realizada';
                                
                            }else{
                                $stateActivity = 'Pendiente';

                            }

                            $folderAnnexes  = $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord."/activity_".$idActivity."_*";
                            $annexes        = glob($folderAnnexes, GLOB_BRACE)? true : false;

                            array_push($DATA, [
                                'idRecord'          => $idRecord,
                                'name'              => $name,
                                'lastname'          => $lastname,
                                'lastMaintance'     => $result1[0]["ultimaMantencion"],
                                'statusActivity'    => $stateActivity,
                                'annexes'           => $annexes,
                            ]);
                        
                        }else{
                            $DATA["ERROR"]      = true;
                            $DATA["ERRNO"]      = 10;
                            $DATA["MESSAGE"]    = "Se ha producido un error con la operación id: ". $idRecord .".Comuníquese con el administrador";

                            $error      = true;
                            break;
                        }
                    }

                    if(!$error){
                        $DATA["ERROR"]      = false;
                        $DATA["COUNT"]      = sizeof($arrayIdRecord);

                        $DATA["nameActivity"]   = $result1[0]["nombre"];
                        $DATA["areaActivity"]   = $result1[0]["area"];
                    }
                }
            }
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>