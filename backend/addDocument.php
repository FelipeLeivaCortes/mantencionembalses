<?php
	session_start();

    include "configuration.php";

	if( empty($LINK) ){
        $DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$nameFile		= $_POST["nameFile"];
		$ID_COMPANY		= $_POST["ID_COMPANY"];
		$description	= $_POST["description"];
		$username		= $_POST["username"];

		$LINK	=  new mysqli($URL, $USERNAME, $PASSWORD, 'empresa'.$ID_COMPANY);

		$QUERY	=	$LINK->prepare("SELECT id FROM documento WHERE nombre = ?;");
		$QUERY	->	bind_param("s", $nameFile);
		$QUERY	-> 	execute();
		$QUERY 	->	store_result();
		$QUERY	-> 	bind_result($idFile);
		$QUERY 	->	fetch();

		if( $QUERY->num_rows == 0 ){
			$directory		= $PATH_FILES.$ID_COMPANY.'/';
			$document		= $directory.basename( $_FILES['subir_archivo']['name'] );

			if( move_uploaded_file( $_FILES['subir_archivo']['tmp_name'], $document) ){
				
				$QUERY 	=  $LINK -> prepare("INSERT INTO documento (nombre, descripcion, encargado) VALUES (? ,?, ?);");
				$QUERY	-> bind_param('ssi', $nameFile, $description, $username);
				$QUERY	-> execute();

				if( $QUERY->affected_rows == 1 ){
					$DATA["ERROR"]		= false;
					$DATA["MESSAGE"]	= 'El documento se cargo exitosamente';
				
				}else{
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 3;
					$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
				}

			}else{
				$DATA["ERROR"]		= true;
				$DATA["ERRNO"]		= 55;
				$DATA["MESSAGE"]	= "No se ha podido cargar el documento";
			}

		}else{
			$DATA["ERROR"]		= true;
			$DATA["ERRNO"]		= 60;
			$DATA["MESSAGE"]	= "El documento con el nombre ".$nameFile." ya se encuentra registrado";
		}
	}

	header('Content-Type: application/json');
	echo json_encode($DATA);
?>
