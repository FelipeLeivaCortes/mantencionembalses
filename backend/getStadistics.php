<?php
    session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        
        $today      = date('Y-m-d');
        $idCompany  = $_POST["idCompany"];

        $QUERY  =   $LINK->prepare("SELECT COUNT(*) FROM usuario WHERE idEmpresa = ?;");
        $QUERY  ->  bind_param("i", $idCompany);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($numUsers);
        $QUERY  ->  fetch();

        $LINK   ->  close();
        $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, "empresa".$idCompany);

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

        $DATA["numUsers"]               =   $numUsers;
        $DATA["numActivities"]          =   $numActivities;
        $DATA["numPendingActivities"]   =   $numPendingActivities;
        $DATA["numPendingRecords"]      =   $numPendingRecords;

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>