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
        $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

    /***************************************************************************** */
    /***************************************************************************** */

        $year       = $_POST["year"];
        $area       = $_POST["area"];
        $priority   = $_POST["priority"];

        $codeArea   = "";
        $workers    = array();

        switch($area){
            case "Mecánica":
                $codeArea   = "0100";
                break;
            case "Eléctrica":
                $codeArea   = "0010";
                break;
            case "Jardinería":
                $codeArea   = "0001";
                break;
            default:
                $codeArea   = "error";
                break;
        }

        $data		=	array(
            "type"			=>	"SELECT",
            "query"			=>	"SELECT rut, nombre, apellido FROM usuario WHERE permisos = ? AND idEmpresa = ?;",
            "parameters"	=>	array(
                                    "si",
                                    $codeArea,
                                    $ID_COMPANY
            )
        );
        $result1	=	query($LINK, $data, false);

        if(sizeof($result1) == 0){
            $DATA["WARNING"]    = "No se han encontrado especialistas del área ".$area.". 
                                    Puede derivar la actividad a otro profesional, aunque por temas de seguridad no se recomienda";

            $data		=	array(
                "type"			=>	"SELECT",
                "query"			=>	"SELECT rut, nombre, apellido, permisos FROM usuario WHERE permisos != '1000' AND idEmpresa = ?;",
                "parameters"	=>	array(
                                        "i",
                                        $ID_COMPANY
                                    )
            );
            $result2	=	query($LINK, $data, false);

            if(sizeof($result2) == 0){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 68;
                $DATA["MESSAGE"]    = "No se han encontrado profesionales para realizar la actividad";

            }else{
                for($i=0; $i<sizeof($result2); $i++){
                    array_push($workers, [
                        'username'      => $result2[$i]["rut"],
                        'nameUser'      => $result2[$i]["nombre"],
                        'lastnameUser'  => $result2[$i]["apellido"],
                        'permission'    => $result2[$i]["permisos"],
                    ]);
                }
            }
        }else if(sizeof($result1) == 1){
            $DATA["WARNING"]    = "";

            array_push($workers, [
                'username'      => $result1[0]["rut"],
                'nameUser'      => $result1[0]["nombre"],
                'lastnameUser'  => $result1[0]["apellido"],
                'permission'    => $codeArea,
            ]);
        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 5;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";
        }
        
        if(sizeof($workers) > 0){
            $activitiesSuggested    = array();
            $activitiesUnavailable  = array();
            $index                  = 0;
            $today                  = date('Y-m-d');

            $suggestions["id"]      = 0;
            $suggestions["data"]    = $activitiesSuggested;

            $LINK   ->  close();
            $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

            $data		=	array(
                "type"			=>	"SELECT",
                "query"			=>	"SELECT id, idActivities FROM sugerencia WHERE revisada = '1' AND fecha <= ?;",
                "parameters"	=>	array(
                                        "s",
                                        $today
                )
            );
            $result2	=	query($LINK, $data, false);
    
            // GETTING THE SUGGESTIONS LIST
            if(sizeof($result2) > 0){
                for($i=0; $i<sizeof($result2); $i++){
                    $arraySuggest   = explode(",", $result2[$i]["idActivities"]);

                    $data		=	array(
                        "type"			=>	"SELECT",
                        "query"			=>	"SELECT area FROM actividad WHERE id = ?;",
                        "parameters"	=>	array(
                                                "i",
                                                $arraySuggest[0]
                        )
                    );
                    $result3	=	query($LINK, $data, false);

                    if($area == $result3[0]["area"]){
                        $suggestions["id"]  = $result2[$i]["id"];

                        for($j=0; $j<sizeof($arraySuggest); $j++){
                            $data		=	array(
                                "type"			=>	"SELECT",
                                "query"			=>	"SELECT nombre, sector, prioridad, observacion FROM actividad WHERE id = ?;",
                                "parameters"	=>	array(
                                                        "i",
                                                        $arraySuggest[$j]
                                )
                            );
                            $result4	=	query($LINK, $data, false);
                            
                            array_push($activitiesSuggested, [
                                'id'            => $arraySuggest[$j],
                                'name'          => $result4[0]["nombre"],
                                'location'      => $result4[0]["sector"],
                                'priority'      => $result4[0]["prioridad"],
                                'observation'   => $result4[0]["observacion"],
                            ]);
                        }

                        $suggestions["data"]    = $activitiesSuggested;
                    }
                }
            }

            $data		=	array(
                "type"			=>	"SELECT",
                "query"			=>	"SELECT actividades, estados FROM registro WHERE estado = '0';",
                "parameters"	=>	""
            );
            $result3	=	query($LINK, $data, false);

            // CYCLE TO ADD THE ACTIVITIES UNAVAIBLES TO SHOW IN THE CALENDAR
            if(sizeof($result3) > 0){
               for($i=0; $i<sizeof($result3); $i++){
                    $arrayAuxId         = explode(",", $result3[$i]["actividades"]);
                    $arrayAuxStates     = explode(",", $result3[$i]["estados"]);

                    for($j=0; $j<sizeof($arrayAuxId); $j++){
                        if($arrayAuxStates[$j] == '0'){
                            $activitiesUnavailable[$index]  = $arrayAuxId[$j];
                            $index++;
                        }
                    }
                }
            };

            // GETTING THE ACTIVITIES PER MONTHS
            for($i=1; $i<=12; $i++){
                $arrayIds           = array();
                $arrayNames         = array();
                $arrayDates         = array();
                $arrayPriorities    = array();
                $index              = 0;
                $query              = "";
                $parameters         = "";

                if($priority == "All"){
                    $query      = "SELECT id, nombre, proximaMantencion, sector, prioridad FROM actividad WHERE area = ? AND 
                                    YEAR(proximaMantencion) = ? AND MONTH(proximaMantencion) = ? AND ultimaMantencion <= ? ORDER BY nombre DESC";
                    $parameters = array("ssis", $area, $year, $i, $today);

                }else{
                    $query      = "SELECT id, nombre, proximaMantencion, sector, prioridad FROM actividad WHERE prioridad = ? AND 
                                    area = ? AND YEAR(proximaMantencion) = ? AND MONTH(proximaMantencion) = ? AND ultimaMantencion <= ? ORDER BY nombre DESC";
                    $parameters = array("ssiis", $priority, $area, $year, $i, $today);
                }

                $data		=	array(
                    "type"			=>	"SELECT",
                    "query"			=>	$query,
                    "parameters"	=>	$parameters
                );
                $result4	=	query($LINK, $data, false);

                for($j=0; $j<sizeof($result4); $j++){
                    $available  = true;

                    // DISCARTING THE ACTIVITIES UNAVAILABLES
                    for($k=0; $k<sizeof($activitiesUnavailable); $k++){
                        if($activitiesUnavailable[$k] == $result4[$j]["id"]){
                            $available  = false;
                            break;
                        }
                    }

                    // ADDING ALL THE ACTIVITIES AVAILABLES
                    if($available){
                        $arrayIds[$index]           = $result4[$j]["id"];
                        $arrayNames[$index]         = $result4[$j]["sector"].": ".$result4[$j]["nombre"];
                        $arrayDates[$index]         = $result4[$j]["proximaMantencion"];
                        $arrayPriorities[$index]    = $result4[$j]["prioridad"];

                        $index++;
                    }
                }

                // STORE THE RESULTS
                array_push($DATA, [
                    'elements'          => $index,
                    'ids'               => $arrayIds,
                    'names'             => $arrayNames,
                    'nextMaintances'    => $arrayDates,
                    'priorities'        => $arrayPriorities, 
                ]);
            }

            $DATA["ERROR"]          = false;
            $DATA["workers"]        = $workers;
            $DATA["suggestions"]    = $suggestions;
        }

		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>