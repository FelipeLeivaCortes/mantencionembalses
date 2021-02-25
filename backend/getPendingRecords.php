<?php
    session_start();
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

        $QUERY  =   $LINK -> prepare("SELECT id, fechaInicio FROM registro WHERE estado = 0");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($id, $startDate);

        $DATA["COUNT"]  = $QUERY->num_rows;

        while ( $QUERY -> fetch() ){
            array_push($DATA, [
                'id'        => $id,
                'startDate' => $startDate,
            ]);
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>