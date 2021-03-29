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

		$idRecord           =   $_POST["idRecord"];
        $arrayFiles         =   explode(",", $_POST["arrayFiles"]);
        $arrayIds           =   explode(",", $_POST["arrayIds"]);

		$folderRecord		=   $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord."/";

		if( !file_exists($folderRecord) ){
			mkdir($folderRecord, 0777, true);
		}

		if( sizeof($arrayIds) > 0 ){
			for( $j=0; $j<sizeof($arrayIds); $j++ ){
				$pathImages     = $folderRecord."imagen_record_".$j.".txt";
				
				if( file_exists( $pathImages ) ){
					unlink( $pathImages );
				}

				$file   = fopen( $pathImages, "w");
				fwrite($file, $arrayIds[$j].PHP_EOL.$arrayFiles[$j]);
				fclose($file);
			}
		}

		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
