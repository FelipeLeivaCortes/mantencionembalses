<?php
    session_start();
    include "configuration.php";
    
	if(	empty($LINK) ){
		$DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
        $idCompany  = $_POST["idCompany"];
        $LINK       = new mysqli($URL, $USERNAME, $PASSWORD, "empresa".$idCompany);
        
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

                $fileContent    = fopen($PATH_FILES.$idCompany.'/thread_'.$idReport.'.txt', 'r');  
                
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
            
        }

        if( !$error ){
            $DATA["ERROR"]  = false;
            $DATA["COUNT"]  = $count;
        }

        $QUERY  ->  free_result();
		$LINK   ->  close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>