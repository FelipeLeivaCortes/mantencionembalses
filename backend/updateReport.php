<?php
    session_start();
    include "configuration.php";
    include "sendMail.php";

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

        $idReport       = $_POST["idReport"];
        $title          = $_POST["title"];
        $author         = $_POST["author"];
        $message        = $_POST["message"];

        $pathFolder	    = $PATH_FILES.$ID_COMPANY."/threads/thread_".$idReport.".txt";

        if( file_exists($pathFolder) ){
            $file   = fopen($pathFolder, "a");
            
            fwrite($file, PHP_EOL."E:".$author.":".$message);
            fclose($file);

            $date			= 	date('d')."/".date('m')."/".date('Y');
            $subject		=  "Han respondido la consulta";
            $body			=  '<html>
                                    <head>
                                        <title>'.$title.'</title>
                                    </head>
                                    <body>
                                        <p>Responsable: '.$author.'<br>'.

                                            'Te informamos que con fecha <b>'.$date.'</b> el usuario ha comentado el hilo de conversación con el siguiente mensaje.<br><br>'.
                                            ''.$message.'.<br>'.
                                            '<br>'.
                                            
                                            'Saludos</p>
                                    </body>
                                </html>';
            
            $errorSendMail	= sendMail("felipe-leiva@hotmail.cl", $subject, $body);

        }else{
            $QUERY  =   $LINK->prepare("DELETE FROM reporte WHERE id = ?");
            $QUERY  ->  bind_param("i", $idReport);
            $QUERY  ->  execute();

            if( $QUERY->affected_rows == 1 ){
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 67;
                $DATA["MESSAGE"]    = "No se ha encontrado el respaldo físico de la conversición, por lo tanto se ha eliminado el registro de conversación con id: ".$idReport;
            
            }else{
                $DATA["ERROR"]      = true;
                $DATA["ERRNO"]      = 85;
                $DATA["MESSAGE"]    = "No se ha encontrado el respaldo físico de la conversición, se intento eliminar el registro de conversación con id: ".$idReport." pero hubo un error. Comuníquese con el administrador";

            }

            
        }
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>