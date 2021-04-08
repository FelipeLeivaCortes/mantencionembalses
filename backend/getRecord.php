<?php
    session_start();
    include "configuration.php";
    require_once "Mobile_Detect.php";
    
   if( empty($LINK) ){
	   $DATA["ERROR"]      = true;
      $DATA["ERRNO"]      = 1;
	   $DATA["MESSAGE"]    = "El servidor no responde";
	
	}else{

   /***************************************************************************** */
	/****** ---> DO NOT EDIT THIS UNLESS IT EXTREMELY NECESSARY <--- ************* */
	/***************************************************************************** */

      $detect     = new Mobile_Detect();

      if( $detect->isMobile() || $detect->isTablet() ){
         $USERNAME   = $_POST["userDatabase"];
         $PASSWORD   = $_POST["passDatabase"];
         $ID_COMPANY = $_POST["idCompany"];
         $DATABASE   = "empresa".$ID_COMPANY;
         
      }else{
         $USERNAME   = $_SESSION["userDatabase"];
         $PASSWORD   = $_SESSION["passDatabase"];
         $ID_COMPANY = $_SESSION["idCompany"];
         $DATABASE   = "empresa".$ID_COMPANY;
         
      }

      $LINK       ->  close();
      $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

   /***************************************************************************** */
   /***************************************************************************** */

      $idRecord     	= intval($_POST["idRecord"]);
      $username      = intval($_POST["username"]);
      $isAdmin       = boolval($_POST["isAdmin"]);

      $QUERY  =   $LINK -> prepare("SELECT encargado, actividades, fechaInicio, estados FROM registro WHERE id = ?");
      $QUERY  ->  bind_param("i", $idRecord);
      $QUERY  ->  execute();
      $QUERY  ->  store_result();
      $QUERY  ->  bind_result($usernameRecorded, $activities, $dateStart, $states);
      $QUERY  ->  fetch();

      if( $QUERY->num_rows == 0 ){
         $DATA["ERROR"]      = true;
         $DATA["ERRNO"]      = 8;
         $DATA["MESSAGE"]    = "No se han encontrado resultados en su búsqueda";
   
      }else if( $QUERY->num_rows > 1){
         $DATA["ERROR"]      = true;
         $DATA["ERRNO"]      = 9;
         $DATA["MESSAGE"]    = "Se han encontrado duplicidades en sus datos. Comuníquese con el administrador";

      }else{
         if( $isAdmin || $username == $usernameRecorded ){   
            $arrayStates         = explode(",", $states);
            $arrayIds           	= explode(",", $activities);
            $arrayActivities    	= array();
            $arrayLocations      = array();
            $arrayWarning       	= array();
            $arrayIdsSuccess     = array();
            $error              	= false;
            $warning            	= 0;
            $success            	= 0;
            $piezometria         = false;

            $LINK       ->  close();
            $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

            $QUERY  ->  free_result();
            $QUERY  =   $LINK -> prepare("SELECT nombre, apellido FROM usuario WHERE rut = ?");
            $QUERY  ->  bind_param("i", $usernameRecorded);
            $QUERY  ->  execute();
            $QUERY  ->  store_result();
            $QUERY  ->  bind_result($name_mandated, $lastname_mandated);
            $QUERY  ->  fetch();

            $LINK       ->  close();
            $LINK       =   new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

            for($i=0; $i<sizeof($arrayIds); $i++){
               $QUERY  ->  free_result();
               $QUERY  =   $LINK -> prepare("SELECT nombre, sector FROM actividad WHERE id = ?");
               $QUERY  ->  bind_param("i", $arrayIds[$i]);
               $QUERY  ->  execute();
               $QUERY  ->  store_result();
               $QUERY  ->  bind_result($nameActivity, $locationActivity);
               $QUERY  ->  fetch();

               if( $QUERY->num_rows == 0 ){
                  $arrayWarning[$warning] = $arrayIds[$i];
                  $warning++;

               }else if( $QUERY->num_rows == 1 ){
                  $arrayActivities[$success]    = $nameActivity;
                  $arrayLocations[$success]     = $locationActivity;
                  $arrayIdsSuccess[$success]    = $arrayIds[$i];
                  $success++;

                  if( $nameActivity == 'realizar piezometría' ){
                     $piezometria   = true;
                  }

               }else{
                  $DATA["ERROR"]          = true;
                  $DATA["ERRNO"]          = 3;
                  $DATA["MESSAGE"]        = "No se pudo llevar a cabo la operación. Comuníquese con el administrador";
                  $error                  = true;
                  break;
               }
            }

            if( !$error ){
               if( $success == 0 ){
                  $DATA["ERROR"]	= true;

                  $QUERY ->  free_result();
                  $QUERY =   $LINK -> prepare("DELETE FROM registro WHERE id = ?");
                  $QUERY ->  bind_param("i", $idRecord);
                  $QUERY ->  execute();

                  if( $QUERY->affected_rows == 1 ){
                     $DATA["ERRNO"]	= 50;
                     $DATA["MESSAGE"]	= "El registro ".$idRecord." tenía asociadas actividades inexistentes, por lo tanto, ha sido eliminado del sistema";

                  }else{
                     $DATA["ERRNO"]	= 51;
                     $DATA["MESSAGE"]	= "El registro ".$idRecord." tiene asociadas actividades inexistentes, y no se pudo eliminar. Comuníquese con el administrador";
                  }

               }else{
                  $arrayObservations   = array();
                  $folderRecord        = $PATH_FILES.$ID_COMPANY."/records/record_".$idRecord."/record_".$idRecord.".txt";

                  if( file_exists($folderRecord) ){
                     $file    = fopen($folderRecord, "r");
                     $index   = 0;

                     while( !feof($file) ){
                        $arrayObservations[$index] = fgets($file);
                        $index++;
                     }
                     
                     fclose($file);
                  }

                  $DATA["ERROR"]             = false;

                  $DATA["warnings"]          = $arrayWarning;
                  $DATA["dateStart"]         = $dateStart;
                  $DATA["observations"]      = $arrayObservations;
                  $DATA["name_mandated"]     = $name_mandated;
                  $DATA["lastname_mandated"] = $lastname_mandated;
                  $DATA["COUNT"]             = sizeof($arrayActivities);

                  for($i=0; $i<sizeof($arrayActivities); $i++){
                     array_push($DATA, [
                        'id'        => $arrayIdsSuccess[$i],
                        'name'      => $arrayActivities[$i],
                        'location'  => $arrayLocations[$i],
                        'state'     => $arrayStates[$i],
                     ]);
                  }

                  if( $piezometria ){
                     $DATA["piezometria"] = true;
                  }
               }
            }
         
         }else{
            $DATA["ERROR"]    = true;
            $DATA["ERRNO"]    = 70;
            $DATA["MESSAGE"]  = "Esta guía de mantención no le ha sido designada a usted";

         }
      }

      $QUERY ->  free_result();
	   $LINK   ->  close();
	}

   header('Content-Type: application/json');
	echo json_encode($DATA);
?>
