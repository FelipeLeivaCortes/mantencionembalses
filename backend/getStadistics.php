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
        $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

    /***************************************************************************** */
    /***************************************************************************** */
        
        $today      = date('Y-m-d');

        $QUERY  =   $LINK->prepare("SELECT COUNT(*) FROM usuario WHERE idEmpresa = ?;");
        $QUERY  ->  bind_param("i", $ID_COMPANY);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($numUsers);
        $QUERY  ->  fetch();

        $QUERY  ->  free_result();
        $QUERY  =   $LINK->prepare("SELECT AES_DECRYPT(licencia, ?) FROM empresa WHERE id = ?;");
        $QUERY  ->  bind_param("si", $KEY, $ID_COMPANY);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($licenseDecoded);
        $QUERY  ->  fetch();

        $LINK   ->  close();
        $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

        $QUERY  ->  free_result();
        $QUERY  =   $LINK->prepare("SELECT COUNT(*) FROM actividad");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($numActivities);
        $QUERY  ->  fetch();

        $QUERY  ->  free_result();
        $QUERY  =   $LINK->prepare("SELECT COUNT(*) FROM actividad WHERE proximaMantencion < ?;");
        $QUERY  ->  bind_param("s", $today);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($numPendingActivities);
        $QUERY  ->  fetch();

        $QUERY  ->  free_result();
        $QUERY  =   $LINK->prepare("SELECT COUNT(*) FROM registro WHERE estado = '0';");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($numPendingRecords);
        $QUERY  ->  fetch();

    //  Procesing the data
        $licenseSplitted                = explode(":", $licenseDecoded);

        $today                          = new DateTime("now");
        $finishDate                     = new DateTime($licenseSplitted[2]);
        $daysRemainingLicense           = date_diff($finishDate, $today)->format('%a');

        $DATA["numUsers"]               =   $numUsers;
        $DATA["numActivities"]          =   $numActivities;
        $DATA["numPendingActivities"]   =   $numPendingActivities;
        $DATA["numPendingRecords"]      =   $numPendingRecords;
        $DATA["remainingDaysLicense"]   =   $daysRemainingLicense;
        $DATA["startLicense"]           =   $licenseSplitted[1];
        $DATA["finishLicense"]          =   $licenseSplitted[2];

        $QUERY  ->  free_result();
		$LINK   ->  close();

    }

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>