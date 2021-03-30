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

        $idActivity     = $_POST["idActivity"];
        $idRecord       = $_POST["idRecord"];

        $folderRecord   = $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord;

        foreach( glob($folderRecord."/activity_{$idActivity}_*.{jpg,jpeg,png}", GLOB_BRACE) as $file ){
            $type   = pathinfo($file, PATHINFO_EXTENSION);
            $data   = file_get_contents($file);
            $base64 = 'data:image/'.$type.';base64,'.base64_encode($data);            
            
            array_push($DATA,[
                'img'   => $base64,
            ]);
        }

  		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
    $DATA   = "";
?>