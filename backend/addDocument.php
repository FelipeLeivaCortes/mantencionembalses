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

		$file			= $_FILES["file"];
		$username		= $_POST["username"];
		$description	= $_POST["description"];
		$type			= $_POST["type"];
		$source			= $_POST["source"];
		
		$filename	= $file["name"];
		$filetype	= $file["type"];
		$tmp_path	= $file["tmp_name"];
		$size		= $file["size"];
		$error		= false;
		$extension	= pathinfo($filename, PATHINFO_EXTENSION);

		$folderStore		= "";
		$pathStore			= "";
		$nameAux			= "";
		$formatAvailables;

		if( $type == "Manual" ){
			$folderStore		= $PATH_FILES.$ID_COMPANY.$PATH_MANUALS;
			$formatAvailables	= array('pdf');

		}else if( $type == "Event" ){
			$folderStore		= $PATH_FILES.$ID_COMPANY.$PATH_EVENTS;
			$formatAvailables	= array('doc', 'docx', 'pdf');

		}

		if( !file_exists($folderStore) ){
			mkdir($folderStore, 0777, true);
		}

		$QUERY	=	$LINK->prepare("SELECT id FROM documento WHERE nombre = ?;");
		$QUERY	->	bind_param("s", $filename);
		$QUERY	-> 	execute();
		$QUERY 	->	store_result();
		$QUERY	-> 	bind_result($idFile);
		$QUERY 	->	fetch();

		if( $QUERY->num_rows == 0 ){

			if( in_array($extension, $formatAvailables) ){
				$pathStore			= $folderStore.$filename;
	
				if( move_uploaded_file($tmp_path, $pathStore) ){
					array_push($DATA, [
						'index'		=> 0,
						'name'		=> $pathStore,
						'status'	=> 'Successfully',
					]);
	
				}else{
					array_push($DATA, [
						'index'		=> 0,
						'name'		=> $pathStore,
						'status'	=> 'Error',
					]);
	
					$error	= true;
				}
		
				if( !$error ){
					$today	= date("Y-m-d");

					$QUERY 	=  $LINK -> prepare("INSERT INTO documento (nombre, descripcion, encargado, tipo, fuente, ultimaEdicion) VALUES (? ,?, ?, ?, ?, ?);");
					$QUERY	-> bind_param('ssisss', $filename, $description, $username, $type, $source, $today);
					$QUERY	-> execute();

					if( $QUERY->affected_rows == 1 ){
						$DATA["ERROR"]		= false;
						$DATA["MESSAGE"]	= 'El documento se cargo exitosamente';
					
					}else{
						unlink($pathStore);
						
						$DATA["ERROR"]		= true;
						$DATA["ERRNO"]		= 3;
						$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
					}

				}

			}else{
				$DATA["ERROR"]		= true;
				$DATA["ERRNO"]		= 89;
				$DATA["MESSAGE"]	= "La extesión del archivo no es aceptada";
		
			}

		}else{
			$DATA["ERROR"]		= true;
			$DATA["ERRNO"]		= 60;
			$DATA["MESSAGE"]	= "El documento con el nombre ".$filename." ya se encuentra registrado";

		}
		
	}

	header('Content-Type: application/json');
	echo json_encode($DATA);
?>
