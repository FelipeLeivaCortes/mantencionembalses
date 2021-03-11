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
        $QUERY  ->  bind_result($id, $dateStart);

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 73;
            $DATA["MESSAGE"]    = "No se han encontrado registros de mantenciones pendientes en el sistema";
        
        }else{
            $DATA["COUNT"]  = $QUERY->num_rows;

            while ( $QUERY -> fetch() ){
                $today      = new DateTime("now");
                $dateAux    = new DateTime($dateStart);
                $daysLate   = date_diff($dateAux, $today)->format('%a');

                array_push($DATA, [
                    'id'        => $id,
                    'dateStart' => $dateStart,
                    'daysLate'  => $daysLate,
                ]);
            }
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>