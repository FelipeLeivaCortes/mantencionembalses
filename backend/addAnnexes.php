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

		$idRecord           = $_POST["idRecord"];
		$idActivity			= $_POST["idActivity"];

		$folderRecord		= $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord."/";

		if( !file_exists($folderRecord) ){
			mkdir($folderRecord, 0777, true);
		}

		$error	= false;

		for($x=0; $x<$_POST["count"]; $x++){
			$file		= $_FILES["file_".$x];
			$name		= $file["name"];
			$type		= $file["type"];
			$tmp_path	= $file["tmp_name"];
			$size		= $file["size"];
	
			if( $type == "application/pdf" ){
				$extension	= explode("/", $type);
				$pathImage	= $folderRecord.'activity_'.$idActivity.'_'.$x.'.'.$extension[1];
				//$pathImage	= $folderRecord.$name;

				if( move_uploaded_file($tmp_path, $pathImage) ){
					array_push($DATA, [
						'index'		=> $x,
						'name'		=> $pathImage,
						'status'	=> 'Successfully',
					]);

				}else{
					array_push($DATA, [
						'index'		=> $x,
						'name'		=> $pathImage,
						'status'	=> 'Error',
					]);

					$error 	= true;
					break;

				}

			}else{
				$dimensions	= getimagesize($tmp_path);
				$width		= $dimensions[0];
				$height 	= $dimensions[1];

				$maxSize	= 1024*1024*5;
				$types  	= ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
				$maxHeight	= 10000;
				$maxWidth	= 10000;
				$minHeight	= 60;
				$minWidth	= 60;
			
				if( $type != $types[0] && $type != $types[1] && $type != $types[2] && $type != $types[3] ){
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 78;
					$DATA["MESSAGE"]	= "El archivo ".($x + 1)." no es una imagen";

				}else if( $size > $maxSize ){
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 79;
					$DATA["MESSAGE"]	= "El tamaño de la imagen ".($x + 1)." supera los ".($maxSize/1000)." mb";
		
				}else if( $height > $maxHeight ){
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 80;
					$DATA["MESSAGE"]	= "La altura de la imagen ".($x + 1)." supera los ".($maxHeight)." px";
			
				}else if( $width > $maxWidth ){
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 81;
					$DATA["MESSAGE"]	= "La anchura de la imagen ".($x + 1)." supera los ".($maxWidth)." px";
		
				}else if( $height < $minHeight ){
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 82;
					$DATA["MESSAGE"]	= "La altura de la imagen ".($x + 1)." es inferior a ".($minHeight)." px";

				}else if( $width < $minWidth ){
					$DATA["ERROR"]		= true;
					$DATA["ERRNO"]		= 83;
					$DATA["MESSAGE"]	= "La anchura de la imagen ".($x + 1)." es inferior a ".($minWidth)." px";

				}else{
					$extension	= explode("/", $type);
					$pathImage	= $folderRecord.'activity_'.$idActivity.'_'.$x.'.'.$extension[1];

					if( move_uploaded_file($tmp_path, $pathImage) ){
						array_push($DATA, [
							'index'		=> $x,
							'name'		=> $pathImage,
							'status'	=> 'Successfully',
						]);

					}else{
						array_push($DATA, [
							'index'		=> $x,
							'name'		=> $pathImage,
							'status'	=> 'Error',
						]);

						$error 	= true;
						break;

					}
				}
			}
		}

		if( !$error ){
			$DATA["ERROR"]		= false;
			$DATA["ERRNO"]		= "";
			$DATA["MESSAGE"]	= "Se han cargado todos los documentos exitosamente";
		
		}else{
			$DATA["ERROR"]		= true;
			$DATA["ERRNO"]		= 84;
			$DATA["MESSAGE"]	= "Se ha producido un error al cargar un documento. Comuníquese con el administrador";

		}

		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
