<?php
    
    session_start();
    
    include "resources.php";
    
    if( !isset($_SESSION['username']) ){
        ?>
            <script>
                ModalReportEvent("Error", 6, "Su sesión ha caducado. Por favor reingresa al sistema");
                location.href = "index.php";
            </script>
        <?php   
    }
?>