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

        if(boolval($_POST["all"])){
            $data		=	array(
                "type"			=>	"SELECT",
                "query"			=>	"SELECT actividades FROM registro WHERE id = ?;",
                "parameters"	=>	array(
                                        "i",
                                        $_POST["idRecord"]
                                    )
            );
            $result1	=	query($LINK, $data, false);
    
            if(sizeof($result1) == 0){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 8;
                $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

            }else if(sizeof($result1) > 1){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 5;
                $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";

            }else{
                $arrayIdActivity = explode(",", $result1[0]["actividades"]);

                $data		=	array(
                    "type"			=>	"SELECT",
                    "query"			=>	"SELECT area FROM actividad WHERE id = ?;",
                    "parameters"	=>	array(
                                            "i",
                                            $arrayIdActivity[0]
                                        )
                );
                $result2	=	query($LINK, $data, false);
        
                if(sizeof($result2) == 0){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 8;
                    $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

                }else if(sizeof($result2) > 1){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 5;
                    $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";

                }else{
                    $data		=	array(
                        "type"			=>	"SELECT",
                        "query"			=>	"SELECT id, nombre, sector, prioridad, observacion FROM actividad WHERE area = ?;",
                        "parameters"	=>	array(
                                                "i",
                                                $result2[0]["area"]
                                            )
                    );
                    $result3	=	query($LINK, $data, true);
            
                    if(sizeof($result3) == 0){
                        $DATA["ERROR"]      = true;
                        $DATA["ERRNO"]      = 8;
                        $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

                    }else{
                        for($i=0; $i<sizeof($result3); $i++){
                            array_push($DATA, [
                                'id'            => $result3[$i]["id"],
                                'name'          => $result3[$i]["nombre"],
                                'location'      => $result3[$i]["sector"],
                                'priority'      => $result3[$i]["prioridad"],
                                'area'          => $result2[0]["area"],
                                'comments'      => $result3[$i]["observacion"],
                            ]);
                        }
                    }
                }
            }

        }else{
            $arrayIdActivities  = explode(",", $_POST["arrayIdActivities"]);
            $error              = false;
            
            for($i=0; $i<sizeof($arrayIdActivities); $i++){
                $data		=	array(
                    "type"			=>	"SELECT",
                    "query"			=>	"SELECT nombre, sector, prioridad, area, observacion FROM actividad WHERE id = ?;",
                    "parameters"	=>	array(
                                            "i",
                                            $arrayIdActivities[$i]
                                        )
                );
                $result1	=	query($LINK, $data, false);
        
                if(sizeof($result1) == 0){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 8;
                    $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
                    $error              = true;

                    break;

                }else if(sizeof($result1) > 1){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 5;
                    $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";
                    $error              = true;

                    break;

                }else{
                    array_push($DATA, [
                        'id'            => $arrayIdActivities[$i],
                        'name'          => $result1[0]["nombre"],
                        'location'      => $result1[0]["sector"],
                        'priority'      => $result1[0]["prioridad"],
                        'area'          => $result1[0]["area"],
                        'comments'      => $result1[0]["observacion"],
                    ]);
                }
            }

            if(!$error){
                $DATA["ERROR"]  = false;
                $DATA["COUNT"]  = $i;
            }

            $LINK   ->  close();
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>