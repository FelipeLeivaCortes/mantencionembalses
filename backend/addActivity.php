<?php
	session_start();
    include "configuration.php";

	if( empty($LINK) ){
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
            "query"			=>	"SELECT id FROM actividad WHERE nombre = ? AND sector = ?;",
            "parameters"	=>	array(
									"ss",
									$_POST["name"],
									$_POST["location"]
								)
        );
        $result1	=	query($LINK, $data, false);

		if(sizeof($result1) >= 1){
			if(boolval($_POST["isExcel"])){
				$DATA["ERROR"]      = false;
				$DATA["MESSAGE"]    = "La actividad ingresada ya está registrada en la base de datos";
			
			}else{
				$DATA["ERROR"]      = true;
				$DATA["ERRNO"]      = 7;
				$DATA["MESSAGE"]    = "La actividad ingresada ya está registrada en la base de datos";
			
			}
		
		}else{
			$data		=	array(
				"type"			=>	"INSERT",
				"query"			=>	"INSERT INTO actividad (nombre, fechaInicio, frecuencia, sector, prioridad, area, ultimaMantencion, 
										proximaMantencion, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
				"parameters"	=>	array(
										"ssissssss",
										$_POST["name"],
										$_POST["date"],
										$_POST["frecuency"],
										$_POST["location"],
										$_POST["priority"],
										$_POST["area"],
										$defaultDate,
										$_POST["date"],
										$_POST["comments"]
									)
			);
			$result2	=	query($LINK, $data, true);

			if($result2 == 0){
				$DATA["ERROR"] 		= true;
				$DATA["ERRNO"]		= 3;
				$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";

			}else{
				$DATA["ERROR"] 		= false;
    			$DATA["MESSAGE"]	= "Se ha agregado la actividad '".$_POST["name"]."' exitosamente";
            
			}
	    
		}
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
