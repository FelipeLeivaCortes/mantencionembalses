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

        $QUERY  =   $LINK -> prepare("SELECT id, titulo FROM reporte");
        $QUERY  ->  execute();
        $QUERY  ->  store_result();
        $QUERY  ->  bind_result($idReport, $title);

        if( $QUERY->num_rows == 0 ){
            $DATA["ERROR"]      = true;
            $DATA["ERRNO"]      = 8;
            $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";

        }else{
            $error          = false;
            $count          = 0;

            while( $QUERY->fetch() ){
                $arrayThread    = array();
                $arraySplited   = array();
                $index          = 0;

                $fileContent    = fopen($PATH_FILES.$ID_COMPANY.'/threads/thread_'.$idReport.'.txt', 'r');  
                
                while( !feof($fileContent) ){
                    $arraySplited[$index] = fgets($fileContent);
                    $index++;
                }

                for( $i=0; $i<$index; $i++ ){
                    $arrayContent   = explode(":", $arraySplited[$i]);

                    array_push($arrayThread, [
                        'type'      => $arrayContent[0],
                        'author'    => $arrayContent[1],
                        'content'   => $arrayContent[2],
                    ]);
                }

                array_push($DATA, [
                    'idReport'  => $idReport,
                    'title'     => $title,
                    'content'   => $arrayThread,
                ]);

                $count++;
            }
            
            if( !$error ){
                $DATA["ERROR"]  = false;
                $DATA["COUNT"]  = $count;
            }
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>