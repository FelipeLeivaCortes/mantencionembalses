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

        $data		=	array(
			"type"			=>	"SELECT",
			"query"			=>	"SELECT id, permisos, nombre, apellido, correo, telefono  FROM usuario WHERE rut = ?",
			"parameters"	=>	array(
									"i",
									$username
								)
		);
		$result1	=	query($LINK, $data, true);	
	
		if(sizeof($result1) == 0){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 4;
            $DATA["MESSAGE"]    = "El rut ingresado no está registrado";

        }else if(sizeof($result1) > 1){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 5;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";

        }else{
            $DATA["ERROR"] 		    = false;

            $DATA["id"]             = $result1[0]["id"];
            $DATA["permissions"] 	= $result1[0]["permisos"];
            $DATA["name"]           = $result1[0]["nombre"];
            $DATA["lastname"]       = $result1[0]["apellido"];
            $DATA["email"]          = $result1[0]["correo"];
            $DATA["phone"]          = $result1[0]["telefono"];
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
