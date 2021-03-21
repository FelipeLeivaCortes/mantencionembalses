<?php
    session_start();
    include "configuration.php";

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

        $idReport       = $_POST["idReport"];
        $author         = $_POST["author"];
        $message        = $_POST["message"];

        $directory      = $PATH_FILES.$ID_COMPANY."/thread_".$idReport.".txt";

        if( file_exists($directory) ){
            $file   = fopen($directory, "a");
            fwrite($file, PHP_EOL."E:".$author.":".$message);
            fclose($file);

        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 67;
            $DATA["MESSAGE"]    = "Se ha eliminado el registro de conversación con id: ".$idReport;
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>