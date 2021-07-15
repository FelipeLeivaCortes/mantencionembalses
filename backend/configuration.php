<?php

  $URL            = "localhost";
	$USERNAME       = "root";
	$PASSWORD       = "";
	$ADMINISTRATION = "administration";
  $PATH_FILES     = "../docs/empresa";
  $PATH_EVENTS    = "/documents/events/";
  $PATH_MANUALS   = "/documents/manuals/";
  $defaultDate    = '1900-01-01';

  date_default_timezone_set("America/Santiago");

# The next variable is to assgin by default the last and next maintance of an activity
	

	$DATA   = array();
	$QUERY  = "";
	$KEY    = "1f4276388ad3214c873428dbef42243f";
	$LINK   = new mysqli($URL, $USERNAME, $PASSWORD, $ADMINISTRATION);

	function encrypt($message, $encryption_key){  
    $secretKey = hex2bin($encryption_key);
    $nonceSize = openssl_cipher_iv_length('aes-256-ctr');
    $nonce = openssl_random_pseudo_bytes($nonceSize);
    $ciphertext = openssl_encrypt(
      $message, 
      'aes-256-ctr', 
      $secretKey,
      OPENSSL_RAW_DATA,
      $nonce
    );

    return base64_encode($nonce.$ciphertext);
  }

  function decrypt($message, $encryption_key){
      $secretKey = hex2bin($encryption_key);
      $message = base64_decode($message);
      $nonceSize = openssl_cipher_iv_length('aes-256-ctr');
      $nonce = mb_substr($message, 0, $nonceSize, '8bit');
      $ciphertext = mb_substr($message, $nonceSize, null, '8bit');
      $plaintext= openssl_decrypt(
        $ciphertext, 
        'aes-256-ctr', 
        $secretKey,
        OPENSSL_RAW_DATA,
        $nonce
      );
      return $plaintext;
  }

  function query($link, $data, $close){
      switch($data["type"]){
      
        case("SELECT"):
          $query  =   $link->prepare($data["query"]);

          if($data["parameters"] != ""){
            call_user_func_array(array($query, 'bind_param'), json2array($data["parameters"]));
          }
          
          $query  ->  execute();
          $meta   =   $query->result_metadata();
          
          while($field = $meta->fetch_field()){
            $parameters[] = &$row[$field->name];
          } 
      
          call_user_func_array(array($query, 'bind_result'), json2array($parameters));
          
          $index  = 0;

          while($query->fetch()){ 
            $x = array();
            
            foreach($row as $key => $val){ 
              $x[$key]  = $val;
            }

            $results[]  = $x;
            $index++;
          }

          $result = $index == 0 ? [] : $results;
          $query  ->  close();

          if($close){
            $link   ->  close();
          }
         
          return  $result;

        case "DELETE":
        case "UPDATE":
        case "INSERT":
          $query  =   $link->prepare($data["query"]);

          if($data["parameters"] != ""){
            call_user_func_array(array($query, 'bind_param'), json2array($data["parameters"]));
          }
          
          $query  ->  execute();

          if($close){
            $link   ->  close();
          }

          return   $query->affected_rows;

        default:
          return "";
      }
  }

  function json2array($arr){
    if (strnatcmp(phpversion(),'5.3') >= 0){
        $refs = array();
        foreach($arr as $key => $value)
            $refs[$key] = &$arr[$key];
        return $refs;
    }
    
    return $arr;
  }
?>
