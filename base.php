<html>
    <head>
	    <?php
	        include "template/session.php";
	    ?>

        <meta http-equiv="Content-Type" content="text/html; charset=gb18030">
        <meta name="viewport" content="width=device-width, user-scalable=no">

        <script src="scripts/sidenav.js"></script>
        <script src="scripts/common.js"></script>
        <script src="scripts/base.js"></script>
        <script src="scripts/stadistics.js"></script>
        <script src="scripts/administration.js"></script>
        <script src="scripts/activities.js"></script>
        <script src="scripts/maintances.js"></script>
        <script src="scripts/records.js"></script>
        <script src="scripts/reports.js"></script>
        <script src="scripts/configuration.js"></script>
        <script src="scripts/contacts.js"></script>
        <script src="scripts/manuals.js"></script>
    </head>
      
    <body>
        <div class="container-fluid h-100">
            <div class = "row">

                <!-- Here we have the sidenav,,, don´t edit because this could will make mistakes -->
                <div class="col-3">
                    <?php
                        include "template/sidenav.php";
                    ?>
                </div>

                <!-- To cover all the remaining space, you must use 7 columns... don´t edit nothing before this -->
                <div class="col-7">
                    <div class="header-container">
                        <?php
                            include "template/header.php"
                        ?>
                    </div>

                    <div class="body-container" id="body-container">
                    </div>
           
                    <div class="footer-container">
                        <div class="row">
                            <div class="col-3">
                            </div>    
                            <div class="col-7">
                                <?php
                                    include "template/footer.php";
                                ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
