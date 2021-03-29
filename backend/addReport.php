<?php
	session_start();
    include "configuration.php";
	include "sendMail.php";

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

		$name		= $_POST["name"];
		$lastname	= $_POST["lastname"];
		$topic		= $_POST["topic"];
		$message	= $_POST["message"];

		$QUERY	=	$LINK -> prepare("INSERT INTO reporte (titulo, estado) VALUES (?, false)");
		$QUERY  ->  bind_param('s', $topic);
		$QUERY  ->  execute();

		if( $QUERY->affected_rows == 1 ){
			$QUERY 	=	$LINK->prepare("SELECT @@IDENTITY;");
			$QUERY	->	execute();
			$QUERY	->	store_result();
			$QUERY	-> 	bind_result($idReport);
			$QUERY 	-> 	fetch();

			if( $QUERY->num_rows == 0 ){
				$DATA["ERROR"] 		= true;
				$DATA["ERRNO"]      = 65;
				$DATA["MESSAGE"]	= "No se ha podido determinar el id de la operación anterior. Comuníquese con el administrador";
			
			}else{
				$directory	= $PATH_FILES.$ID_COMPANY."/thread_".$idReport.".txt";

				$file		= fopen($directory, "w");
				fwrite($file, 'E:'.$name." ".$lastname.":".$message);
				fclose($file);

				$date			= 	date('Y-m-d');
				$subject		=  "Tienes una nueva consulta";
				$body			=  '<html>
										<head>
											<title>'.$topic.'</title>
										</head>
										<body>
											<p>Responsable: '.$name.' '.$lastname.'<br>'.

												'Te informamos que con fecha <b>'.$date.'</b> se ha abierto un nuevo hilo de conversación con el siguiente mensaje.<br><br>'.
												''.$message.'.<br>'.
												'<br>'.
												
												'Saludos</p>
										</body>
									</html>';
				
				$errorSendMail	= sendMail("felipe-leiva@hotmail.cl", $subject, $body);

				$DATA["ERROR"] 		= false;
				$DATA["MESSAGE"]	= "Se ha agregado la consulta exitosamente";
				$DATA["idReport"]	= $idReport;
			}

		}else{
			$DATA["ERROR"] 		= true;
			$DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
