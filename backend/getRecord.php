<?php
    session_start();
    include "configuration.php";
    
    	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
           $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
           $idCompany  	= $_POST["idCompany"];
           $id         	= $_POST["id"];

	   $LINK	= new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);

           $QUERY  =   $LINK -> prepare("SELECT encargado, actividades, fechaInicio, estado FROM registro WHERE id = ?");
           $QUERY  ->  bind_param("i", $id);
           $QUERY  ->  execute();
           $QUERY  ->  store_result();
           $QUERY  ->  bind_result($username, $activities, $dateStart, $state);
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
              $QUERY  ->  free_result();
              $LINK   =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

              $QUERY  =   $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?");
              $QUERY  ->  bind_param("i", $username);
              $QUERY  ->  execute();
              $QUERY  ->  store_result();
              $QUERY  ->  bind_result($name, $lastname);
              $QUERY  ->  fetch();

              if($QUERY->num_rows == 0){
                 $DATA["ERROR"]      = true;
                 $DATA["ERRNO"]      = 4;
                 $DATA["MESSAGE"]    = "El rut ingresado no está registrado";
            
              }else if($QUERY->num_rows > 1){
                 $DATA["ERROR"]      = true;
                 $DATA["ERRNO"]      = 9;
                 $DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
            
              }else{
		 $LINK			= new mysqli($URL, $USERNAME, $PASSWORD, $idCompany);
                 $arrayIds           	= explode(",", $activities);
                 $arrayActivities    	= array();
                 $arrayWarning       	= array();
                 $error              	= false;
                 $warning            	= 0;
                 $success            	= 0;

                 for($i=0; $i<sizeof($arrayIds); $i++){
                    $QUERY  ->  free_result();
                    $QUERY  =   $LINK -> prepare("SELECT nombre FROM actividad WHERE id = ?");
                    $QUERY  ->  bind_param("i", $arrayIds[$i]);
                    $QUERY  ->  execute();
                    $QUERY  ->  store_result();
                    $QUERY  ->  bind_result($nameActivity);
                    $QUERY  ->  fetch();

                    if( $QUERY->num_rows == 0 ){
                        $arrayWarning[$warning] = $arrayIds[$i];
                        $warning++;

                    }else if( $QUERY->num_rows == 1 ){
                        $arrayActivities[$success]    = $nameActivity;
                        $success++;

                    }else{
                        $DATA["ERROR"]          = true;
                        $DATA["ERRNO"]          = 3;
                        $DATA["MESSAGE"]        = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                        $error                  = true;
                        break;
                    }
                 }

                 if(!$error){
		    if( $success == 0 ){
		       $DATA["ERROR"]	= true;

		       $QUERY ->  free_result();
		       $QUERY =   $LINK -> prepare("DELETE FROM registro WHERE id = ?");
		       $QUERY ->  bind_param("i", $id);
		       $QUERY ->  execute();

		       if( $QUERY->affected_rows == 1 ){
		          $DATA["ERRNO"]	= 50;
			  $DATA["MESSAGE"]	= "El registro ".$id." tenía asociadas actividades inexistentes, por lo tanto, ha sido eliminado del sistema";

		       }else{
			  $DATA["ERRNO"]	= 51;
			  $DATA["MESSAGE"]	= "El registro ".$id." tiene asociadas actividades inexistentes, y no se pudo eliminar. Comuníquese con el administrador";
		       }

		    }else{
                       $DATA["ERROR"]      = false;
                       $DATA["warnings"]   = $arrayWarning;

                       $DATA["id"]         = $id;
                       $DATA["name"]       = $name;
                       $DATA["lastname"]   = $lastname;
                       $DATA["activities"] = $arrayActivities;
                       $DATA["dateStart"]  = $dateStart;
                       $DATA["state"]      = $state;
		    }
                 }
              }
           }

           $QUERY ->  free_result();
	   $LINK   ->  close();
	}

    	header('Content-Type: application/json');
	echo json_encode($DATA);
?>
