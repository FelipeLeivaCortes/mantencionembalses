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
	
		$username 			= $_POST["username"];
        $activities			= $_POST["activities"];
		$deleteSuggestion	= boolval($_POST["deleteSuggestion"]);
		$idSuggestion		= $_POST["idSuggestion"];

		$dateStart	= date('Y-m-d');

		$arrayActivities	= explode(",", $activities);
		$stringStates		= "0";
		$stringImportance	= "0";

		for( $i=1; $i<sizeof($arrayActivities); $i++ ){
			$stringStates 		= $stringStates.',0';
			$stringImportance	= $stringImportance.",0";
		}

		$data		=	array(
			"type"			=>	"INSERT",
			"query"			=>	"INSERT INTO registro (encargado, actividades, fechaInicio, fechaTermino, estados, importancias) VALUES (?, ?, ?, ?, ?, ?);",
			"parameters"	=>	array(
									"isssss",
									$username,
									$activities,
									$dateStart,
									$defaultDate,
									$stringStates,
									$stringImportance
								)
		);
		$result1	=	query($LINK, $data, false);

		if($result1 == 0){
			$DATA["ERROR"]	    = true;
			$DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		
		}else if($result1 == 1){
			$data		=	array(
				"type"			=>	"SELECT",
				"query"			=>	"SELECT LAST_INSERT_ID();",
				"parameters"	=>	""
			);
			$result2	=	query($LINK, $data, false);
	
			if(sizeof($result2) == 0){
				$DATA["ERROR"]      = true;
				$DATA["ERRNO"]      = 3;
				$DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";

			}else if(sizeof($result2) == 1){

				if($deleteSuggestion){
					$data		=	array(
						"type"			=>	"DELETE",
						"query"			=>	"DELETE FROM sugerencia WHERE id = ?;",
						"parameters"	=>	array(
												"i",
												$idSuggestion
											)
					);
					$result3	=	query($LINK, $data, false);
			
					if($result3 == 0){
						$DATA["ERROR"] 		= false;
						$DATA["MESSAGE"]	= "Se han registrado las actividades exitosamente";
						$DATA["id"]			= $result2[0]["LAST_INSERT_ID()"];
					
					}else{
						$DATA["ERROR"] 		= true;
						$DATA["ERRNO"]		= "N";
						$DATA["MESSAGE"]	= "No se ha podido eliminar la sugerencia con id: ".$idSuggestion;
					}

				}else{
					$DATA["ERROR"] 		= false;
					$DATA["MESSAGE"]	= "Se han registrado las actividades exitosamente";
					$DATA["id"]			= $result2[0]["LAST_INSERT_ID()"];
				}
			}
		}
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
