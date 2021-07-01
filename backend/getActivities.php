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

        $arrayIdActivities  = explode(",", $_POST["arrayIdActivities"]);
        $today              = date('Y-m-d');
        $error              = false;

        for( $i=0; $i<sizeof($arrayIdActivities); $i++ ){
            $idActivity     = $arrayIdActivities[$i];

            $QUERY  =   $LINK -> prepare("SELECT nombre, sector, prioridad, area, observacion FROM 
                                            actividad WHERE id = ?");

            $QUERY  ->  bind_param("i", $idActivity);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($name, $location, $priority, $area, $comments);
            $QUERY  ->  fetch();

            if( $QUERY->num_rows == 0 ){
                $DATA["ERRPR"]      = true;
                $DATA["ERRNO"]      = 8;
                $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
                $error              = true;

                break;

            }else{
                array_push($DATA, [
                    'id'            => $idActivity,
                    'name'          => $name,
                    'location'      => $location,
                    'priority'      => $priority,
                    'area'          => $area,
                    'comments'      => $comments,
                ]);

            }

        }

        if( !$error ){
            $DATA["ERROR"]  = false;
            $DATA["COUNT"]  = $i;
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>