<?php
   session_start();
   include "configuration.php";
    
   if( empty($LINK) ){
      $DATA["ERROR"]	= true;
      $DATA["ERRNO"]	= 1;
      $DATA["MESSAGE"]    = "El servidor no responde";

   }else{
      $companyName	= 'Junta de Vigilancia del rio Elqui:';
      $seasonStart	= '2021-02-01:';
      $seasonEnd	= '2022-03-01';

      $message		= $companyName.$seasonStart.$seasonEnd;

      echo "Your hash is: \r\n".encrypt($message, $KEY);
        
   }

#  header('Content-Type: application/json');
   echo json_encode($DATA);
?>
