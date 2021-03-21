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
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

    /***************************************************************************** */
    /***************************************************************************** */
    
        $username   = $_POST["username"];

        $QUERY 	    =   $LINK -> prepare("SELECT id, permisos, nombre, apellido, correo, telefono  FROM usuario WHERE rut = ?");
        $QUERY	    ->	bind_param('i', $username);
        $QUERY      ->  execute();
        $QUERY      ->  store_result();
        $QUERY      ->  bind_result($id, $permissions, $name, $lastname, $email, $phone);
        
        if( $QUERY -> num_rows == 1 ){
            $DATA["ERROR"] 		= false;
            $DATA["MESSAGE"]	= "";

            $QUERY              -> fetch();
            
            $DATA["id"]             = $id;
            $DATA["permissions"] 	= $permissions;
            $DATA["name"]           = $name;
            $DATA["lastname"]       = $lastname;
            $DATA["email"]          = $email;
            $DATA["phone"]          = $phone;

        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 4;
            $DATA["MESSAGE"]    = "El rut ingresado no está registrado";
            
        }
        
        $QUERY      -> free_result();
        $LINK       -> close();
        
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
