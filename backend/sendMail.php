<?php
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require 'Exception.php';
    require 'PHPMailer.php';
    require 'SMTP.php';

function sendMail($receiver, $Subject, $Body){
    $mail   = new PHPMailer(true);

    try{
        $mail->SMTPDebug        = 0;
        $mail->isSMTP();
        $mail->Host             = "smtp.gmail.com";
        $mail->SMTPAuth         = true;
        $mail->Username         = "mantencionembalses@gmail.com";
        $mail->Password         = "LtLt1505#";
        $mail->SMTPSecure       = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port             = 587;

        $mail->setFrom('mantencionembalses@gmail.com');
        $mail->addAddress($receiver);

        $mail->isHTML(true);
        $mail->Subject  = utf8_decode($Subject);
        $mail->Body     = utf8_decode($Body);

        $mail->send();

        return false;
 
    } catch(Exception $e){
        return true;

    }

}