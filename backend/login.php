<?php
    session_start();
    include "configuration.php";
    
	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
           $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
	   $username	=   $_POST["username"];
	   $password	=   $_POST["password"];

	   $QUERY	=   $LINK->prepare("SELECT idEmpresa, estado, AES_DECRYPT(clave,?), permisos, nombre, apellido FROM usuario WHERE rut = ?;");
	   $QUERY	->  bind_param('si', $KEY, $username);
	   $QUERY	->  execute();
	   $QUERY	->  store_result();
           $QUERY	->  bind_result($idEmpresa, $state, $clave, $permisos, $nombre, $apellido);
        
           if( $QUERY->num_rows == 1 ){
			
              $QUERY->fetch();

	      if( $state == 1 ){
            
	         if( $password == $clave ){

		   $QUERY	->  free_result();
		   $QUERY	=   $LINK -> prepare("SELECT AES_DECRYPT(licencia, ?) FROM empresa WHERE id = ?");
		   $QUERY	->  bind_param("si", $KEY, $idEmpresa);
		   $QUERY	->  execute();
		   $QUERY 	->  store_result();
		   $QUERY 	->  bind_result($licenseDecoded);
		   $QUERY 	->  fetch();

		   if($QUERY->num_rows == 0){
		      $DATA["ERROR"]	= true;
		      $DATA["ERRNO"]	= 38;
		      $DATA["MESSAGE"]	= "No se han encontrado licencias registradas. Comuníquese con el administrador";
				
		   }else if($QUERY->num_rows > 1){
		      $DATA["ERROR"]	= true;
		      $DATA["ERRNO"]	= 9;
		      $DATA["MESSAGE"]	= "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";
				
		   }else{
		      $today 	= date('Y-m-d');
		      $expiration 	= explode(":", $licenseDecoded);

		      if($today <= $expiration[2]){
		         $DATA["ERROR"]		= false;
		         $DATA["permissions"]	= $permisos;
		         $DATA["name"]		= $nombre;
		         $DATA["lastname"]		= $apellido;
		         $DATA["idEmpresa"]	= $idEmpresa;
					
		         $_SESSION['username']	= $_POST["username"];
		         $_SESSION['name']		= $nombre;
		         $_SESSION['lastname']	= $apellido;
		         $_SESSION['timesession']	= time();
					
		      }else{
		         $DATA["ERROR"]      = true;
		         $DATA["ERRNO"]      = 11;
		         $DATA["MESSAGE"]    = "La licencia ha expirado. Comuníquese con el administrador";
		      }
		   }
	        }else{
	           $DATA["ERROR"]      = true;
		   $DATA["ERRNO"]      = 14;
		   $DATA["MESSAGE"]    = "La contraseña ingresada es incorrecta";
	        }
	     }else{
	        $DATA["ERROR"]		= true;
		$DATA["ERRNO"]		= 49;
		$DATA["MESSAGE"]	= "El acceso a este usuario se encuentra deshabilidado. Comuníquese con el administrador";
	     }
	  }else{
	     $DATA["ERROR"]      = true;
	     $DATA["ERRNO"]      = 4;
	     $DATA["MESSAGE"]    = "El rut ingresado no está registrado";
	  }

          $QUERY  -> free_result();
	  $LINK   -> close();
    }

    header('Content-Type: application/json');
    echo json_encode($DATA);
?>
