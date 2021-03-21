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

        if($_POST){
            $username   = $_POST["username"];
            $hash       = str_replace(' ', '+', $_POST["hash"]);
        }

        $QUERY  =   $LINK -> prepare("SELECT usuario.idEmpresa, usuario.permisos, empresa.nombre, AES_DECRYPT(licencia, ?) FROM usuario INNER JOIN empresa ON usuario.idEmpresa = empresa.id WHERE usuario.rut = ?");
        $QUERY  ->  bind_param("si", $KEY, $username);
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($companyId, $permisions, $companyName, $currentLicense);
        $QUERY  ->  fetch();

        if($permisions == '1000'){
            $hashDecrypted  = decrypt($hash, $KEY);
            $licenseSplited = explode(":", $hashDecrypted);

            if($companyName != $licenseSplited[0]){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 39;
                $DATA["MESSAGE"]    = "La licencia ingresada no es válida";
                
                $QUERY  =   $LINK -> prepare("UPDATE empresa SET licencia = AES_ENCRYPT(?, ?) WHERE id = ?");
                $QUERY  ->  bind_param("ssi", $currentLicense, $KEY, $companyId);
                $QUERY  ->  execute();

            }else{
                $QUERY  =   $LINK -> prepare("UPDATE empresa SET licencia = AES_ENCRYPT(?, ?) WHERE id = ?");
                $QUERY  ->  bind_param("ssi", $hashDecrypted, $KEY, $companyId);
                $QUERY  ->  execute();

                if($QUERY->affected_rows == 1){
                    $DATA["ERROR"]      = false;
                    $DATA["MESSAGE"]    = "Su licencia se ha activado exitosamente, vuela a iniciar sesión.";
                }else{
                    $DATA["ERROR"]      = true;
                    $DATA["ERRNO"]      = 3;
                    $DATA["MESSAGE"]    = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                }
                
            }

        }else{
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 39;
            $DATA["MESSAGE"]    = "Su usuario no cuenta con los permisos necesarios para llevar a cabo esta operación";
        }

        $QUERY ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>