<?php
    session_start();
    include "configuration.php";
    
   if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
      $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
      $idCompany  	= $_POST["idCompany"];
           
	   $LINK    = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

      $QUERY   =   $LINK -> prepare("SELECT id, nombre, descripcion FROM documento");
      $QUERY  ->  execute();
      $QUERY  ->  store_result();
      $QUERY  ->  bind_result($idFile, $nameFile, $descriptionFile);

      if( $QUERY->num_rows < 1 ){
         $DATA["ERROR"]      = true;
         $DATA["ERRNO"]      = 8;
         $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
      
      }else{

         while( $QUERY->fetch() ){
            array_push($DATA, [
               'id'           => $idFile,
               'name'         => $nameFile,
               'description'  => $descriptionFile,
            ]);
         }
      
      }
      
      $QUERY   ->  free_result();
	   $LINK    ->  close();
	}

   header('Content-Type: application/json');
	echo json_encode($DATA);
?>