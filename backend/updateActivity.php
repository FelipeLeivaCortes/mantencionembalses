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
        $name       = $_POST["name"];
        $dateStart  = $_POST["dateStart"];
        $frecuency  = $_POST["frecuency"];
        $location   = $_POST["location"];
        $priority   = $_POST["priority"];
        $area       = $_POST["area"];
        $comments   = $_POST["comments"];
        
		$QUERY  =   $LINK -> prepare("UPDATE actividad SET nombre = ?, fechaInicio = ?, frecuencia = ?, sector = ?, prioridad = ?, area = ?, observacion = ? WHERE id = ?");
		$QUERY  ->	bind_param('ssissssi', $name, $dateStart, $frecuency, $location, $priority, $area, $comments, $id);
        $QUERY  ->  execute();
        
        if( $QUERY->affected_rows == 1 ){
            $DATA["ERROR"] 		= false;
			$DATA["MESSAGE"]	= "Se han modificado los datos exitosamente. Para ver los cambios haga click en la sección de 'Actividades'";
        
        }else{
            $DATA["ERROR"] 		= true;
            $DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>