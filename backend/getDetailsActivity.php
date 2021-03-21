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
        
        $id         = $_POST["id"];
        
        $QUERY  =   $LINK -> prepare("SELECT nombre, fechaInicio, frecuencia, sector, prioridad, area, observacion FROM actividad WHERE id = ?");
        $QUERY  ->  bind_param("i", $id);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($name, $dateStart, $frecuency, $location, $priority, $area, $comments);

        if( $QUERY->num_rows == 1 ){
            $QUERY ->  fetch();
            
            $DATA["name"]       = $name;
            $DATA["dateStart"]  = $dateStart;
            $DATA["frecuency"]  = $frecuency;
            $DATA["location"]   = $location;
            $DATA["priority"]   = $priority;
            $DATA["area"]       = $area;
            $DATA["comments"]   = $comments;
            
        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 3;
		    $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>