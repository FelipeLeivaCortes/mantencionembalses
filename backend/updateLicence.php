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

    /*    $USERNAME   = $_SESSION["userDatabase"];
        $PASSWORD   = $_SESSION["passDatabase"];
        $ID_COMPANY = $_SESSION["idCompany"];
        $DATABASE   = "empresa".$ID_COMPANY;
      
        $LINK       ->  close();
        $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);
    */

    /***************************************************************************** */
    /***************************************************************************** */

        if($_POST){
            $username   = $_POST["username"];
            $hash       = str_replace(' ', '+', $_POST["hash"]);
        }

        $data		=	array(
            "type"			=>	"SELECT",
            "query"			=>	"SELECT usuario.idEmpresa, usuario.permisos, empresa.nombre, AES_DECRYPT(licencia, ?) 
                                FROM usuario INNER JOIN empresa ON usuario.idEmpresa = empresa.id WHERE usuario.rut = ?",
            "parameters"	=>	array(
                                    "si",
                                    $KEY,
                                    $username                                    
                                )
        );
        $result1	=	query($LINK, $data, false);

        if(sizeof($result1) == 0){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados para su búsqueda";
        
        }else if(sizeof($result1) > 1){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 5;
            $DATA["MESSAGE"]    = "Se han encontrado duplicidades en los datos. Comuníquese con el administrador";

        }else{
            if($result1[0]["permisos"] != "1000"){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 39;
                $DATA["MESSAGE"]    = "Su usuario no cuenta con los permisos necesarios para llevar a cabo esta operación";
            
            }else{
                $hashDecrypted  = decrypt($hash, $KEY);
                $licenseSplited = explode(":", $result1[0]["AES_DECRYPT(licencia, ?)"]);

                if($result1[0]["nombre"] != $licenseSplited[0]){
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 39;
                    $DATA["MESSAGE"]    = "La licencia ingresada no es válida para su empresa";

                }else{
                    $data		=	array(
                        "type"			=>	"UPDATE",
                        "query"			=>	"UPDATE empresa SET licencia = AES_ENCRYPT(?, ?) WHERE id = ?",
                        "parameters"	=>	array(
                                                "ssi",
                                                $hashDecrypted,
                                                $KEY,
                                                $result1[0]["idEmpresa"]                    
                        )
                    );
                    $result2	=	query($LINK, $data, true);

                    if($result2 == 1){
                        $DATA["ERROR"]      = false;
                        $DATA["MESSAGE"]    = "Su licencia se ha activado exitosamente, vuela a iniciar sesión.";
                    
                    }else{
                        $DATA["ERROR"]      = true;
                        $DATA["ERRNO"]      = 3;
                        $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                    }
                }
            }
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>