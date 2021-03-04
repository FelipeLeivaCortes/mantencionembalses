<?php
    session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany      = $_POST["idCompany"];
        $idReport       = $_POST["idReport"];
        $author         = $_POST["author"];
        $message        = $_POST["message"];

        if( file_exists( $PATH_FILES.$idCompany."/thread_".$idReport.".txt" ) ){
            $file   = fopen( $PATH_FILES.$idCompany."/thread_".$idReport.".txt", "a");
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