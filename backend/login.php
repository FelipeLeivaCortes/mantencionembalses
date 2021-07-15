<?php
    session_start();
    include "configuration.php";
	require_once "Mobile_Detect.php";
    
	if( empty($LINK) ){
		$DATA["ERROR"]      = true;
    	$DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$username	=   $_POST["username"];
		$password	=   $_POST["password"];
		
		$data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT idEmpresa, estado, AES_DECRYPT(clave,?), permisos, nombre, apellido FROM usuario WHERE rut = ?;",
			"parameters"	=>	array(
									"si",
									$KEY,
									$username
								)
		);
		$result1	=	query($LINK, $data, false);

		if(sizeof($result1) == 0){
			$DATA["ERROR"]      = true;
			$DATA["ERRNO"]      = 4;
			$DATA["MESSAGE"]    = "El rut ingresado no está registrado";
		
		}else if(sizeof($result1) > 1){
			$DATA["ERROR"]      = true;
			$DATA["ERRNO"]      = 9;
			$DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
		
		}else{
			if($result1[0]["estado"] == 0){
				$DATA["ERROR"]		= true;
				$DATA["ERRNO"]		= 49;
				$DATA["MESSAGE"]	= "El acceso a este usuario se encuentra deshabilidado. Comuníquese con el administrador";
			
			}else{
				if($result1[0]["AES_DECRYPT(clave,?)"] != $password){
					$DATA["ERROR"]      = true;
					$DATA["ERRNO"]      = 14;
					$DATA["MESSAGE"]    = "La contraseña ingresada es incorrecta";

				}else{
					$data	=	array(
						"type"			=>	"SELECT",
						"query"			=>	"SELECT usuario, AES_DECRYPT(licencia, ?), AES_DECRYPT(clave, ?) FROM empresa WHERE id = ?",
						"parameters"	=>	array(
												"ssi",
												$KEY,
												$KEY,
												$result1[0]["idEmpresa"]
											)
					);
					$result2	=	query($LINK, $data, true);

					if(sizeof($result2) == 0){
						$DATA["ERROR"]	= true;
						$DATA["ERRNO"]	= 38;
						$DATA["MESSAGE"]	= "No se han encontrado licencias registradas. Comuníquese con el administrador";
					
					}else if(sizeof($result2) > 1){
						$DATA["ERROR"]      = true;
						$DATA["ERRNO"]      = 9;
						$DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
					
					}else{
						$today 			= date('Y-m-d');
						$expiration 	= explode(":", $result2[0]["AES_DECRYPT(licencia, ?)"]);

						if($today > $expiration[2]){
							$DATA["ERROR"]      = true;
							$DATA["ERRNO"]      = 11;
							$DATA["MESSAGE"]    = "La licencia ha expirado. Comuníquese con el administrador";

						}else{
							$DATA["ERROR"]				= false;
							$DATA["permissions"]		= $result1[0]["permisos"];
							$DATA["name"]				= $result1[0]["nombre"];
							$DATA["lastname"]			= $result1[0]["apellido"];
							$DATA["idCompany"]			= $result1[0]["idEmpresa"];

							$_SESSION['idCompany']		= $result1[0]["idEmpresa"];
							$_SESSION['userDatabase']	= $result2[0]["usuario"];
							$_SESSION['passDatabase']	= $result2[0]["AES_DECRYPT(clave, ?)"];
							$_SESSION['username']		= $_POST["username"];
							$_SESSION['name']			= $result1[0]["nombre"];
							$_SESSION['lastname']		= $result1[0]["apellido"];
							$_SESSION['timesession']	= time();

							$detect	= new Mobile_Detect();

							if( $detect->isMobile() || $detect->isTablet() ){
								$DATA["userDatabase"]		= $result2[0]["usuario"];
								$DATA["passDatabase"]		= $result2[0]["AES_DECRYPT(clave, ?)"];
							}
						}
					}
				}
			}
		}
	}

    header('Content-Type: application/json');
    echo json_encode($DATA);
	
?>
