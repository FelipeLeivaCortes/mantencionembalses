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
      $type             = $_POST["type"];
      $sourceDocument   = $_POST["sourceDocument"];
      $typeDocument     = $_POST["typeDocument"];

      $folderStore   = "";

      if( $type == "Manual" ){
         $folderStore	= $PATH_FILES.$ID_COMPANY."/documents/manuals/";

      }else if( $type == "Event" ){
         $folderStore	= $PATH_FILES.$ID_COMPANY."/documents/events/";

      }

      if( !file_exists($folderStore) ){
         $QUERY   =   $LINK -> prepare("DELETE FROM documento WHERE tipo = ?;");
         $QUERY   ->  bind_param("s", $type);
         $QUERY   ->  execute();

         $DATA["ERROR"]		= true;
         $DATA["ERRNO"]		= 90;
         $DATA["MESSAGE"]	= "La carpeta contenedora de documentos no existe. Comuníquese con el administrador";

      }else{
         $state   = "";
         $source  = "";

         if( $sourceDocument == "" && $typeDocument == "" ){
            $QUERY   =   $LINK -> prepare("SELECT id, nombre, descripcion, encargado, fuente, archivado, ultimaEdicion FROM documento WHERE tipo = ? ORDER BY nombre DESC");
            $QUERY   ->  bind_param("s", $type);
            $QUERY   ->  execute();
            $QUERY   ->  store_result();
            $QUERY   ->  bind_result($idFile, $nameFile, $descriptionFile, $author, $source, $state, $date);
         
         }else if( $sourceDocument == "" && $typeDocument != "" ){
            $QUERY   =   $LINK -> prepare("SELECT id, nombre, descripcion, encargado, fuente, ultimaEdicion FROM documento WHERE tipo = ? AND archivado = ? ORDER BY nombre DESC");
            $QUERY   ->  bind_param("si", $type, $typeDocument);
            $QUERY   ->  execute();
            $QUERY   ->  store_result();
            $QUERY   ->  bind_result($idFile, $nameFile, $descriptionFile, $author, $source, $date);
            
            $state   = $typeDocument;

         }else if( $sourceDocument != "" && $typeDocument == "" ){
            $QUERY   =   $LINK -> prepare("SELECT id, nombre, descripcion, encargado, ultimaEdicion FROM documento WHERE tipo = ? AND fuente = ? ORDER BY nombre DESC");
            $QUERY   ->  bind_param("ss", $type, $sourceDocument);
            $QUERY   ->  execute();
            $QUERY   ->  store_result();
            $QUERY   ->  bind_result($idFile, $nameFile, $descriptionFile, $author, $date);

            $source = $sourceDocument;

         }else if( $sourceDocument != "" && $typeDocument != "" ){
            $QUERY   =   $LINK -> prepare("SELECT id, nombre, descripcion, encargado, ultimaEdicion FROM documento WHERE tipo = ? AND archivado = ? AND fuente = ? ORDER BY nombre DESC");
            $QUERY   ->  bind_param("sis", $type, $typeDocument, $sourceDocument);
            $QUERY   ->  execute();
            $QUERY   ->  store_result();
            $QUERY   ->  bind_result($idFile, $nameFile, $descriptionFile, $author, $date);
            
            $state   = $typeDocument;
         }

         if( $QUERY->num_rows < 1 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 58;
            $DATA["MESSAGE"]    = "No se han encontrado documentos en el sistema";
         
         }else{
            $LINK ->  close();
            $LINK =   new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

            while( $QUERY->fetch() ){
               $DATA["COUNT"]    = $QUERY->num_rows;
               $DATA["fakepath"] = $folderStore;

               $QUERY_AUX  =  $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?;");
               $QUERY_AUX  -> bind_param("i", $author);
               $QUERY_AUX  -> execute();
               $QUERY_AUX  -> store_result();
               $QUERY_AUX  -> bind_result($name, $lastname);
               $QUERY_AUX  -> fetch();

               array_push($DATA, [
                  'id'           => $idFile,
                  'name'         => $nameFile,
                  'description'  => $descriptionFile,
                  'author'       => $name." ".$lastname,
                  'source'       => $source,
                  'state'        => $state,
                  'date'         => $date,
               ]);
            }
         
         }
      }

      $QUERY   ->  free_result();
	   $LINK    ->  close();
	}

   header('Content-Type: application/json');
	echo json_encode($DATA);
?>
