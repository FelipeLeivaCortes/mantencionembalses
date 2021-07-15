<?php
	session_start();

    include "configuration.php";
	include "sendMail.php";
	
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
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

	/***************************************************************************** */
    /***************************************************************************** */

		$username   = $_POST["username"];
    	$permissions= $_POST["permissions"];
		$name       = $_POST["name"];
		$lastname   = $_POST["lastname"];
		$email      = $_POST["email"];
		$phone      = $_POST["phone"];

		if( ctype_digit($phone) == false ){
        	$phone  = "";
		}
	
		$data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT id FROM usuario WHERE rut = ?",
			"parameters"	=>	array(
									"i",
									$username
								)
		);
		$result1	=	query($LINK, $data, false);	
	
		if(sizeof($result1) >= 1){
			$DATA["ERROR"]      = true;
        	$DATA["ERRNO"]      = 2;
        	$DATA["MESSAGE"]    = "El rut ingresado ya está registrado en la base de datos";

	    }else{
			$password   =   substr($username, 0, 4);
			$data		=	array(
				"type"			=>	"INSERT",
				"query"			=>	"INSERT INTO usuario (idEmpresa, rut, clave, permisos, nombre, apellido, correo, telefono, estado) 
										VALUES (?, ?, AES_ENCRYPT(?, ?), ?, ?, ?, ?, ?, 1)",
				"parameters"	=>	array(
										"iissssssi",
										$ID_COMPANY,
										$username,
										$password,
										$KEY,
										$permissions,
										$name,
										$lastname,
										$email,
										$phone
									)
			);
			$result2	=	query($LINK, $data, true);

			if($result2 == 0){
				$DATA["ERROR"]	= true;
				$DATA["ERRNO"]	= 3;
				$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
			
			}else if($result2 == 1){
				$subject		=  "Bienvenido al Sistema";
				$body			=  '<html>
										<head>
											<title>Bienvenido al Sistema</title>
										</head>
										<body>
											<p>Estimado(a): '.$name. ' '.$lastname.'<br><br>'.

												'Te damos la más cordial bienvenida a la plataforma digital para regular mantenciones en estación Puclaro.<br>'.
												'Para hacer ingreso al sistema debes utilizar tu <b>Rut</b> y tu clave (Los primeros <b>4 dígitos de tu Rut</b>).<br>'.
												'<br>'.
												'Ante cualquier duda informanos al correo mantencionembalses@gmail.com o al número +569 4943 3578<br><br>'.
												
												'Saludos</p>
										</body>
									</html>';
				
				$errorSendMail	= sendMail($email, $subject, $body);					
				
				$DATA["ERROR"] 		= false;
				$DATA["MESSAGE"]	= !$errorSendMail ? "Se ha agregado el usuario ".$name." ".$lastname." exitosamente" : "Se ha agregado el usuario ".$name." ".$lastname.
										" exitosamente, pero no se ha podido enviar mensaje de bienvenida";
	
			}
	    }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
