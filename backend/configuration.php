<?php

	$URL        = "localhost";
	$USERNAME   = "JVRE";
	$PASSWORD   = "LtLt1505#";
	$DATABASE   = "administration";
  $PATH_FILES = "../docs/empresa";

# The next variable is to assgin by default the last and next maintance of an activity
	$defaultDate 	= '1900-01-01';

	$DATA	= array();
	$QUERY	= "";
	$KEY	= "1f4276388ad3214c873428dbef42243f";
	$LINK	= new mysqli($URL, $USERNAME, $PASSWORD, $DATABASE);

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

?>
