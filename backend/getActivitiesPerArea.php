<?php
    session_start();
    include "configuration.php";
    
	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
           $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
           $idCompany	= $_POST["idCompany"];
	   $area	= $_POST["area"];
           $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

           $QUERY  =   $LINK -> prepare("SELECT id, nombre, sector FROM actividad WHERE area = ? ORDER BY nombre ASC");
           $QUERY  ->  bind_param("s", $area);
           $QUERY  ->  execute();
           $QUERY  ->  store_result();
           $QUERY  ->  bind_result($id, $name, $location);

           if( $QUERY->num_rows == 0 ){
              $DATA["ERROR"]      = true;
              $DATA["ERRNO"]      = 8;
	      $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

           }else{
              $DATA["ERROR"]      = false;
	      $DATA["count"]      = $QUERY->num_rows;
	
	      while ( $QUERY -> fetch() ){
	         array_push($DATA, [
		    'id'    	=> $id,
		    'name'  	=> $name,
		    'location'	=> $location,
		 ]);
	      }
            }

           $QUERY ->  free_result();
	   $LINK   ->  close();
	}

        header('Content-Type: application/json');
	echo json_encode($DATA);
?>
