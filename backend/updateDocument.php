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

        $idFile         = $_POST["idFile"];
        $type           = $_POST["type"];
        $newName        = $_POST["newName"];
        $newDescription = $_POST["newDescription"];

        $QUERY  =   $LINK->prepare("SELECT nombre, descripcion FROM documento WHERE id = ?;");
        $QUERY  ->  bind_param("i", $idFile);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($oldName, $oldDescription);
        $QUERY  ->  fetch();

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
      
        }else if( $QUERY->num_rows > 1 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 9;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
  
        }else{

        //  Is necessary detect if the name changed, the description, or both
            $operations     = "";
            $folderStore    = "";

            if( $type == "Manual" ){
                $folderStore		= $PATH_FILES.$ID_COMPANY.$PATH_MANUALS;
                
            }else if( $type == "Event" ){
                $folderStore		= $PATH_FILES.$ID_COMPANY.$PATH_EVENTS;
                
            }

            $oldDocument    = $folderStore.$oldName;
            $newDocument    = $folderStore.$newName;  
        
            if( $oldName != $newName ){
                $QUERY  =   $LINK->prepare("UPDATE documento SET nombre = ? WHERE id = ?;");
                $QUERY  ->  bind_param("si", $newName, $idFile);
                $QUERY  ->  execute();
                
                if( $QUERY->affected_rows == 1 ){
                    if( rename($oldDocument, $newDocument) ){
                        $operations         = "name,";
                        $DATA["ERROR"]      = false;
                    
                    }else{
                        $DATA["ERROR"]      = true;
                        $DATA["ERRNO"]      = 59;
                        $DATA["MESSAGE"]    = "No se ha podido actualizar el documento ".$newName;
        
                    }
                
                }else{
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 60;
                    $DATA["MESSAGE"]    = "El documento con el nombre ".$newName." ya se encuentra registrado";
                }
            }
            
            if( $oldDescription != $newDescription ){
                $QUERY  =   $LINK->prepare("UPDATE documento SET descripcion = ? WHERE id = ?;");
                $QUERY  ->  bind_param("si", $newDescription, $idFile);
                $QUERY  ->  execute();

                if( $QUERY->affected_rows == 1 ){
                    $operations         = $operations."description";
                    $DATA["ERROR"]      = false;
                
                }else{
                    $DATA["ERROR"]      = false;
                    $DATA["ERRNO"]      = 3;
                    $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                }
            }
            
            if( $operations == "name," ){
                $DATA["MESSAGE"]    = "Se ha actualizado el nombre del documento exitosamente";
            
            }else if( $operations == "description" ){
                $DATA["MESSAGE"]    = "Se ha actualizado la descripción del documento exitosamente";

            }else if( $operations == "name,description" ){
                $DATA["MESSAGE"]    = "Se han actualizado el nombre y la descripción del documento exitosamente";

            }
            
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>