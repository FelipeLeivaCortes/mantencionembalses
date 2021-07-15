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
    
        $data		=	array(
            "type"			=>	"SELECT",
            "query"			=>	"SELECT id, idRecord, fecha, idActivities FROM sugerencia WHERE revisada = 0",
            "parameters"	=>	""
        );
        $result1	=	query($LINK, $data, false);

        if(sizeof($result1) == 0){
            $DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]	= "No se han encontrado resultados en su búsqueda";
        
        }else{
            $DATA["ERROR"]      = false;
            $DATA["count"]      = sizeof($result1);

            $error              = false;
            
            for($i=0; $i<sizeof($result1); $i++){
                $arrayActivityNames = array();
                $arrayActivitiesIds = explode(",", $result1[$i]["idActivities"]);

                for($j=0; $j<sizeof($arrayActivitiesIds); $j++){
                    $data		=	array(
                        "type"			=>	"SELECT",
                        "query"			=>	"SELECT nombre FROM actividad WHERE id = ?;",
                        "parameters"	=>	array(
                                                "i",
                                                $arrayActivitiesIds[$j]
                                            )
                    );
                    $result2	=	query($LINK, $data, false);

                    if(sizeof($result2) == 0){
                        $DATA["ERROR"] 		= true;
                        $DATA["ERRNO"]      = 8;
                        $DATA["MESSAGE"]	= "No se han encontrado resultados en su búsqueda";

                        $error  = true;
                        break;
                    
                    }else if(sizeof($result2) > 1){
                        $DATA["ERROR"] 		= true;
                        $DATA["ERRNO"]      = 5;
                        $DATA["MESSAGE"]	= "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";

                        $error  = true;
                        break;

                    }else{
                        array_push($arrayActivityNames, [
                            "name"  => $result2[0]["nombre"],
                        ]);
                    }
                }

                array_push($DATA, [
                    'id'            => $result1[$i]["id"],
                    'date'          => $result1[$i]["fecha"],
                    'idRecord'      => $result1[$i]["idRecord"],
                    'activityNames' => $arrayActivityNames,
                ]);

                if($error){
                    break;
                }	
			}
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>