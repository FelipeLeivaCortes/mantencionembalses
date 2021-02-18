<?php
    session_start();
    include "configuration.php";

	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{

        $idCompany  = $_POST["idCompany"];
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
        $aux        = $_POST["idArray"];
        $idArray    = explode(",", $aux);
        $error      = false;
        
        for($i=0; $i<sizeof($idArray); $i++){
            $id     =   intval($idArray[$i]);
            $QUERY  =   $LINK -> prepare("SELECT COUNT(*) FROM registro WHERE id = ?");
            $QUERY  ->  bind_param("i", $id);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($count);
            $QUERY  ->  fetch();

            if($count != 1){
                $error = true;
                break;
            }
            
        }
        
        if($error){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 9;
		    $DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";

        }else{
            $error              = false;
            $index              = 0;
            
            for($i=0; $i<sizeof($idArray); $i++){
                $id     =   intval($idArray[$i]);
                $QUERY  =   $LINK -> prepare("UPDATE registro SET revisada = 1 WHERE id = ?");
                $QUERY  ->	bind_param('i', $id);
                $QUERY  ->  execute();

                if( $QUERY->affected_rows != 1 ){
                    $error  = true;
                    break;
                }else{
                    $index++;
                    array_push($DATA, [
                        'id'        => $id,
                        'status'    => "OK",
                    ]);
                }
            }

            if($error){
                $DATA["ERROR"] 		= true;
                $DATA["ERRNO"]      = 10;
                $DATA["MESSAGE"]	= "Se ha producido un error con la operación id: " . $idArray[$index] . ". Comuníquese con el administrador";
            
            }else{
                $DATA["ERROR"] 		= false;
                $DATA["MESSAGE"]	= "Se han modificado los datos exitosamente";
            }

        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>