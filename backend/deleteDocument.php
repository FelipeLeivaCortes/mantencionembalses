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

        $id         = $_POST["id"];
        $type       = $_POST["type"];
        
        $QUERY  =   $LINK->prepare("SELECT nombre FROM documento WHERE id = ?;");
        $QUERY  ->  bind_param("i", $id);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($nameFile);
        $QUERY  ->  fetch();
        
        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
      
        }else if( $QUERY->num_rows > 1){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 9;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
  
        }else{
            $folderStore    = "";

            if( $type == "Manual" ){
                $folderStore		= $PATH_FILES.$ID_COMPANY."/documents/manuals/".$nameFile;
    
            }else if( $type == "Event" ){
                $folderStore		= $PATH_FILES.$ID_COMPANY."/documents/events/".$nameFile;
    
            }
      
            if( unlink($folderStore) ){
                $QUERY  =   $LINK->prepare("DELETE FROM documento WHERE id = ?");
                $QUERY  ->  bind_param("i", $id);
                $QUERY  ->  execute();
                
                if( $QUERY->affected_rows == 1 ){
                    $DATA["ERROR"]      = false;
                    $DATA["MESSAGE"]    = "Se ha eliminado el documento exitosamente";
                
                }else{
                    $DATA["ERROR"]      = false;
                    $DATA["ERRNO"]      = 3;
                    $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                }
         
            }else{
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 57;
                $DATA["MESSAGE"]    = "No se ha podido eliminar el documento ".$nameFile;

            }
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>