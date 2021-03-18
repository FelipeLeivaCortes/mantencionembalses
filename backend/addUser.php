<?php  
    include "configuration.php";
	include "sendMail.php";

	$LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);
	
	if( empty($LINK) ){
        $DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
	/*	$idCompany  = $_POST["idCompany"];
		$username   = $_POST["username"];
    	$permissions= $_POST["permissions"];
		$name       = $_POST["name"];
		$lastname   = $_POST["lastname"];
		$email      = $_POST["email"];
		$phone      = $_POST["phone"];
	*/	 
	$idCompany  = $_GET["idCompany"];
	$username   = $_GET["username"];
	$permissions= $_GET["permissions"];
	$name       = $_GET["name"];
	$lastname   = $_GET["lastname"];
	$email      = $_GET["email"];
	$phone      = $_GET["phone"];

		if( ctype_digit($phone) == false ){
        	$phone  = "";
		}
	
		$QUERY   =   $LINK -> prepare("SELECT id FROM usuario WHERE rut = ?");
		$QUERY   ->	bind_param('i', $username);
    	$QUERY   ->  execute();
    	$QUERY   ->  store_result();
        $QUERY   ->  bind_result($rut);
		$QUERY   ->  fetch();
	
		if( $QUERY->num_rows >= 1 ){
        	$DATA["ERROR"]      = true;
        	$DATA["ERRNO"]      = 2;
        	$DATA["MESSAGE"]    = "El rut ingresado ya está registrado en la base de datos";
		
	    }else{
			$QUERY -> free_result();

# PREPARE THE QUERY FOR INSERT THE NEW USER INTO THE DATABASE    		
# The default password is the first fours numbers of the rut.

    		$password   =   substr($username, 0, 4);
    		$QUERY 	    =   $LINK -> prepare("INSERT INTO usuario (idEmpresa, rut, clave, permisos, nombre, apellido, correo, telefono, estado) 
    		                                    VALUES (?, ?, AES_ENCRYPT(?, ?), ?, ?, ?, ?, ?, 1)");
    		$QUERY	    ->	bind_param('iissssssi', $idCompany, $username, $password, $KEY, $permissions, $name, $lastname, $email, $phone);
            $QUERY      ->  execute();

			if( $QUERY->affected_rows == 1 ){
				$subject		=  "Bienvenido al Sistema";
				$body			=  '<html>
										<head>
											<title>Bienvenido al Sistema</title>
										</head>
										<body>
											<p>Estimado(a): '.$name. ' '.$lastname.'<br><br>'.

												'Te damos la más cordial bienvenida al sistema de integración de procesos de empresas Bermúdez.<br>'.
												'Para hacer ingreso al sistema debes utilizar tu <b>Rut</b> y tu clave (Los primeros <b>4 dígitos de tu Rut</b>).<br>'.
												'Ante cualquier duda informanos al correo mantencionembalses@gmail.com o al número +569 4943 3578<br><br>'.
												
												'Saludos</p>
										</body>
									</html>';
				
				$errorSendMail	= sendMail($email, $subject, $body);					
				
				if( !$errorSendMail ){
					$DATA["ERROR"] 		= false;
					$DATA["MESSAGE"]	= "Se ha agregado el usuario ".$name." ".$lastname." exitosamente";

				}else{
					$DATA["ERROR"] 		= false;
					$DATA["MESSAGE"]	= "Se ha agregado el usuario ".$name." ".$lastname." exitosamente, pero no se ha podido enviar mensaje de bienvenida";

				}
	
			}else{
				$DATA["ERROR"]	= true;
				$DATA["ERRNO"]	= 3;
				$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
			
			}
	    }

        $QUERY  -> free_result();
	   	$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
