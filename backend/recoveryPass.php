<?php
    
   	include "configuration.php";
	include "sendMail.php";

   	if( empty($LINK) ){
      $DATA["ERROR"]	= true;
      $DATA["ERRNO"]	= 1;
      $DATA["MESSAGE"]	= "El servidor no responde";
	
   	}else{
      $username	=   $_POST["username"];

      $QUERY	=   $LINK -> prepare("SELECT correo, nombre, apellido FROM usuario WHERE rut = ?");
      $QUERY	->  bind_param('i', $username);
      $QUERY	->  execute();
      $QUERY	->  store_result();
      $QUERY	->  bind_result($email, $name, $lastname);

      if( $QUERY -> num_rows == 1 ){
	  $QUERY	->  fetch();
	  $QUERY	->  free_result();

	  $password	=   substr( md5(microtime()), 1, 8);

	  $QUERY	=   $LINK -> prepare("UPDATE usuario SET clave = AES_ENCRYPT(?, ?) WHERE rut = ?");
	  $QUERY	->  bind_param('ssi', $password, $KEY, $username);
	  $QUERY	->  execute();

	  if( $QUERY->affected_rows == 1 ){

	     $Subject	=  "Solicitud cambio de clave";
	     $Body	=  '<html>
			      <head>
				 <title>Solicitud cambio de contraseña</title>
			      </head>
			      <body>
				 <p>Estimado(a): '.$name. ' '.$lastname.'<br><br>'.
					'Tu clave ha sido cambiada debido a una solicitud reciente.<br>'.
					'Tu nueva clave de acceso es:<br><br>'.
					'     <b>'.$password.'</b><br><br>'.
					'Quedamos atentos a cualquier duda o inquietud que tengas al correo mantencionembalses@gmail.com o al número +569 49433578<br><br>'.
					'Saludos</p>
			      </body>
			   </html>';
 
			$errorSendMail	= sendMail($email, $Subject, $Body);					
			
			if( !$errorSendMail ){
				$DATA["ERROR"]		= false;
	     		$DATA["MESSAGE"]	= "Se ha enviado tu nueva clave al correo: ".$email;

			}else{
				$DATA["ERROR"]		= true;
	     		$DATA["MESSAGE"]	= "No se ha podido enviar la nueva contraseña al correo ".$email.". Comuníquese con el administrador";
			}
            
	  }else{
	     $DATA["ERROR"]      = true;
	     $DATA["ERRNO"]      = 3;
	     $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
	    
	  }

      }else{
	  $DATA["ERROR"]	= true;
	  $DATA["ERRNO"]	= 4;
	  $DATA["MESSAGE"]	= "El rut ingresado no está registrado";
      }

      $QUERY	-> free_result();
      $LINK	-> close();
   }

   header('Content-Type: application/json');
   echo json_encode($DATA);
?>
