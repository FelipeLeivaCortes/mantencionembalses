<?php  
    include "configuration.php";
    
    $LINK = new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

	if(	empty($LINK) ){
        $DATA["ERROR"]      = true;
        $DATA["ERRNO"]      = 1;
		$DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{
		$idCompany  = $_POST["idCompany"];
		$name		= $_POST["name"];
		$lastname	= $_POST["lastname"];
		$topic		= $_POST["topic"];
		$message	= $_POST["message"];

		$LINK	=	new mysqli($URL, $USERNAME, $PASSWORD, "empresa".$idCompany);

		$QUERY	=	$LINK -> prepare("INSERT INTO reporte (titulo, estado) VALUES (?, false)");
		$QUERY  ->  bind_param('s', $topic);
		$QUERY  ->  execute();

		if( $QUERY->affected_rows == 1 ){
			$QUERY 	=	$LINK->prepare("SELECT @@IDENTITY;");
			$QUERY	->	execute();
			$QUERY	->	store_result();
			$QUERY	-> 	bind_result($idReport);
			$QUERY 	-> 	fetch();

			if( $QUERY->num_rows == 0 ){
				$DATA["ERROR"] 		= true;
				$DATA["ERRNO"]      = 65;
				$DATA["MESSAGE"]	= "No se ha podido determinar el id de la operación anterior. Comuníquese con el administrador";
			
			}else{
				$file		= fopen( $PATH_FILES.$idCompany."/thread_".$idReport.".txt", "w");
				fwrite($file, 'E:'.$name." ".$lastname.":".$message);
				fclose($file);

				$DATA["ERROR"] 		= false;
				$DATA["MESSAGE"]	= "Se ha agregado la consulta exitosamente";
			}

		}else{
			$DATA["ERROR"] 		= true;
			$DATA["ERRNO"]      = 3;
			$DATA["MESSAGE"]	= "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
		}

        $QUERY  -> free_result();
		$LINK   -> close();
	}

    header('Content-Type: application/json');
	echo json_encode($DATA);
?>
