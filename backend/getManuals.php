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

      $QUERY   =   $LINK -> prepare("SELECT id, nombre, descripcion FROM documento ORDER BY nombre DESC");
      $QUERY  ->  execute();
      $QUERY  ->  store_result();
      $QUERY  ->  bind_result($idFile, $nameFile, $descriptionFile);

      if( $QUERY->num_rows < 1 ){
         $DATA["ERROR"]      = true;
         $DATA["ERRNO"]      = 58;
         $DATA["MESSAGE"]    = "No se han encontrado documentos en el sistema";
      
      }else{

         while( $QUERY->fetch() ){
            $DATA["COUNT"]    = $QUERY->num_rows;

            array_push($DATA, [
               'id'           => $idFile,
               'idCompany'    => $ID_COMPANY,
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
