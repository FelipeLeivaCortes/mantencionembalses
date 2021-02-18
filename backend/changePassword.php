<?php
    include "configuration.php";
    
	if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
           $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";

	}else{
	   $username       = $_POST["username"];
           $oldPassword    = $_POST["oldPassword"];
           $newPassword    = $_POST["newPassword"];

	   $QUERY	=   $LINK -> prepare("SELECT AES_DECRYPT(clave, ?) FROM usuario WHERE rut = ?");
	   $QUERY	->  bind_param('si', $KEY, $username);
	   $QUERY	->  execute();
	   $QUERY	->  store_result();
           $QUERY	->  bind_result($currentPass);
	   $QUERY	->  fetch();        

           if( $QUERY->num_rows == 1 ){ 
              if( $currentPass == $oldPassword ){
        	 $QUERY		=   $LINK -> prepare("UPDATE usuario SET clave = AES_ENCRYPT(?, ?) WHERE rut = ?");
                 $QUERY		->  bind_param('ssi', $newPassword, $KEY, $username);
                 $QUERY		->  execute();
            
                 if( $QUERY->affected_rows == 1 ){
                    $DATA["ERROR"]      = false;
                    $DATA["MESSAGE"]    = "Se ha actualizado la contraseña exitosamente";
                
                 }else{
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 3;
                    $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                 }
            
              }else{
                 $DATA["ERROR"]      = true;
                 $DATA["ERRNO"]      = 25;
                 $DATA["MESSAGE"]    = "La contraseña actual ingresada no coincide con la registrada";
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
